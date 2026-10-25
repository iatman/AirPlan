---
title: Linux - OOM > out of memory
date: 2017-11-19T00:00:00+08:00
lastmod: 2018-05-22T00:00:00+08:00
tags: ["Linux", "TiDB", "OOM", "Troubleshooting"]
---
## 0x00 开头

测试机器环境配置比较低，使用 TiDB Join 表连接查询时偶尔会出现重启现象，按照官方指导查看问题原因说时 TiDB-server OOM 了，那么 OOM 是什么呢？为什么 OOM 啊？怎么才能避免 OOM 呢？  
思考这个现象的时候在网上搜到了一些内容，在本文总结下（~~从其他家复制到自己家~~）  

## 0x01 现象

TiDB-server 运行在一个 8U 8G 的虚拟机上，有时候 BDA 写出一些神奇的 SQL 在 TiDB-server 上运行的会导致内存瞬间上涨；根据需要查询的数据量级，可能会瞬间导致内存爆炸然后触发 TiDB-server 重启。  
通过以下三种方式交叉验证 TiDB-server 是否是 OOM：

1. 内存在用状态可以在监控上看到一个上涨趋势，位置在 `TiDB-dashboard > server > memory` 查看，出现重启的现象就是内存瞬间上涨然后出现断崖式下降。  
2. 链接 TiDB-server 的 mysql 客户端会出现一条信息返回 `ERROR 2013 (HY000): Lost connection to MySQL server during query`
3. 使用 root 用户登录 Linux 系统，然后执行 `dmesg -T | grep -i oom` 命令，查看是否有相应信息返回
   - dmesg 记录了硬件启动后自检信息、kernel 系统运行信息

## 0x02 原因

TiDB-server 相比 mysql ，木有临时物理表、木有中间数据转存磁盘。所以当 client 发起请求从 TiDB 获取大量数据时，TiDB 需要从 TiKV 获取数据然后在 TiDB-server 内存中做计算，此处的计算会造成写放大，然后内存爆炸导致触发 Linux OOM 机制。

这个现象影响程度不定，如果是在线联机服务遇见这种情况就是日了🐶啦，如果是测试或者内部人员使用还好，大家重新执行个查询就好了。该现象木有啥完美解决方案，可以考虑找个超大内存机器部署 TiDB-server 、或者让 DBA 处理数据时缩小范围（不明所以）。

## 0x03 OOM

> linux OOM killer（Out Of Memory killer）这个东西会在系统内存耗尽的情况下跳出来，选择性的干掉一些进程以求释放一些内存（~~不负责的个人经验：这把刀杀的是压死骆驼的最后一根稻草，并不是捅刀子最多的人~~）  
> Linux 下每个进程都有个 OOM 权重，在 `/proc/<pid>/oom_adj` 里面，权重是 -17 ~~ +15  
> 同时 OOM killer 会计算一个叫 score 的东东 `/proc/<pid>/oom_score` ，天黑闭眼之后用来确定要被杀的人；这个值是系统收集 进程的内存消耗量（计算时：父进程会承包所有子进程的内存占用）、CPU 时间 (utime + stime)、生存时间 (uptime - start time)、oom_adj 综合计算之后的结果  
> 消耗内存越多分越高，存活时间越长分越低 == “损失最少的工作，释放最大的内存同时不伤及无辜的用了很大内存的进程，并且杀掉的进程数尽量少”

友好方式人工控制降低被杀几率，辣么就是控制进程的权重，比如这样调整 `echo -17 > /proc/$PID/oom_adj` “源码说 -17 可以禁止进程被 OOM，15 会最大几率被打死”

还有个不那么友好的方案：

- 修改参数 `/proc/sys/vm/overcommit_memory` 可以控制进程对内存过量使用的应对策略
  - `overcommit_memory=0` 允许进程轻微过量使用内存，但对于瞬间大容量内存占用请求则不允许【默认值】
    - 单次申请的内存大小不能超过 【free memory + free swap + pagecache 大小 + SLAB 中可回收的部分】，否则本次申请失败。
  - `overcommit_memory=1` 永远允许进程 overcommit
  - `overcommit_memory=2` 永远禁止 overcommit

> 本段内容复制于 [LINUX MEMORY OVERCOMMIT](http://linuxperf.com/?p=102)

overcommit 还有个延伸内容，那就是怎么判断什么是 overcommit？Linux 内核设置了个内存阈值开关，超过开关后直接干掉。所以配置成 overvcommit 时注意修改参数 `/proc/meminfo`

```shell
# grep -i commit /proc/meminfo
CommitLimit:     5967744 kB
Committed_AS:    5363236 kB
```

CommitLimit 就是 overcommit 的阈值，申请的内存总数超过 CommitLimit 的话就算是 overcommit。  
这个阈值是如何计算出来的呢？它既不是物理内存的大小，也不是 free memory 的大小，它是通过内核参数 vm.overcommit_ratio 或 vm.overcommit_kbytes 间接设置的，公式如：`CommitLimit = (Physical RAM * vm.overcommit_ratio / 100) + Swap`

vm.overcommit_ratio 是内核参数，缺省值是 50，表示物理内存的 50%。如果你不想使用比率，也可以直接指定内存的字节数大小，通过另一个内核参数 vm.overcommit_kbytes 即可.
如果使用了 huge pages，那么需要从物理内存中减去，公式变成：`CommitLimit = ([total RAM] – [total huge TLB RAM]) * vm.overcommit_ratio / 100 + swap`
参见 https://access.redhat.com/solutions/665023

/proc/meminfo 中的 Committed_AS 表示所有进程已经申请的内存总大小，（注意是已经申请的，不是已经分配的），如果 Committed_AS 超过 CommitLimit 就表示发生了 overcommit，超出越多表示 overcommit 越严重。Committed_AS 的含义换一种说法就是，如果要绝对保证不发生 OOM (out of memory) 需要多少物理内存。

查看内存使用状况的常用工具 sar -r ，输出结果中有两个与 overcommit 有关，kbcommit 和 %commit  

- kbcommit 对应 / proc/meminfo 中的 Committed_AS
- %commit 的计算公式并没有采用 CommitLimit 作分母，而是 Committed_AS/(MemTotal+SwapTotal)，意思是_内存申请_占_物理内存与交换区之和_的百分比

```shell
$ sar -r

05:00:01 PM kbmemfree kbmemused  %memused kbbuffers  kbcached  kbcommit   %commit  kbactive   kbinact   kbdirty
05:10:01 PM    160576   3648460     95.78         0   1846212   4939368     62.74   1390292   1854880         4
```

课外阅读 [How to Configure the Linux Out-of-Memory Killer](https://www.oracle.com/technical-resources/articles/it-infrastructure/dev-oom-killer.html)
