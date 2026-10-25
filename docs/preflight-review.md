# 提交前检查（2026-10-25）

结论：本轮检查发现的问题已修复，未发现阻断当前主题提交的构建或页面问题。
检查基于准备提交的全部现存文件（含未跟踪但未忽略的源码），没有执行 Git 提交、推送或远端部署。

## 本轮修复

| 问题 | 处理 |
| --- | --- |
| 代码换行、图片预览和返回顶部仍用固定 CSS/JS URL，有旧缓存继续执行旧脚本的风险 | 统一迁入 assets，使用 Hugo 压缩、内容指纹与 SRI，保留自定义静态资源的兼容回退 |
| 首次无缓存构建 favicon 有重复输出路径警告 | 保留原始角标图，预生成相同的 32/64/180px 图标后直接发布指纹资源，消除重复加工警告 |
| 不支持原生 dialog 的浏览器会调用缺失的 showModal | 能力检测后降级为原图链接，目录和表格增强继续工作 |
| 缺少 aspect-ratio 支持可能导致空日历格高度不足 | 方格增加最小高度回退 |
| 减少动态效果时的返回顶部使用 instant | 改用 auto，与已有 reduced-motion 样式配合 |
| 历史站内链接大小写和旧 Docs/Monitor 相对地址失效 | 修正为实际 Hugo 路径；Blackbox 指向对应组件文档；TIME.md 指向已核对的 node_exporter 官方文档 |
| 未启用的时序图库引用缺失 woff | 保留实际存在的 woff2，删除不存在的回退引用 |
| 原基础 CSS 引用了不随源码提交的 source map | 去掉该调试映射声明，不改样式规则 |
| 锁文件、Python 缓存、public 和 node_modules 可能误入提交 | 添加忽略规则；旧 Even 中已经跟踪的文件删除仍按主题合并计划保留 |

所有本轮迁移后的脚本/样式源码位置：

- 主题运行时：`themes/ihx/assets/js/ihx.js`
- 共用脚本：`assets/js/theme.js`、`assets/js/archive.js`、`assets/js/code-wrap.js`、`assets/js/back-to-top.js`
- 共用样式：`assets/css/archive.css`、`assets/css/feed.css`、`assets/css/code-wrap.css`、`assets/css/back-to-top.css`
- 图标：`themes/ihx/assets/branding/icons/`，像素来自原 icon.png 的既有 Hugo 输出，视觉不变。

## 干净构建

从 Git 中已有的现存文件及未忽略的新文件复制出独立目录；不复制 .git、本地图片加工缓存、node_modules 或已删除的 Even。
在该目录用 GitHub Actions 同版本 Hugo 0.110.0 Extended 分别以 dark / light 为默认风格执行：

```sh
hugo --minify --printPathWarnings --printI18nWarnings
python3 scripts/check_site.py public
```

两种默认配置均构建通过，没有重复路径或缺少翻译警告。无需 npm 或 Webpack。
生产输出检查覆盖 260 个 HTML 页面与 88 个 XML 文件：站内链接、图片、CSS/JS、字体引用均有效；无重复 HTML ID、SRI 校验失败或无效 XML。
Markdown 原有 CRLF 和合法的双空格换行予以保留，差异检查按 CRLF 兼容规则通过。

## 浏览器验证

使用干净生产输出进行 Chromium 自动化；没有依赖 Hugo 开发服务器的热加载状态。

- 全部 79 篇公开 Post/Look 文章在 320px 下的亮暗布局，无整页横向溢出。
- 首页、归档、About、标签和 404 页面可用；页面所需本地请求无 404，脚本无异常。
- 主题默认值、跨页面保持、跨标签同步、本地存储不可用时切换正常。
- 热力图日期计数、闰年、日筛选、标签筛选与年份目录联动正常；旧缓存模拟下仍加载指纹资源。
- 正文与引用系统字体、代码换行及行号对齐、窄屏相邻文章标题、顶部多标签正常。
- 图片 Enter 打开/Escape 关闭；缺少原生 dialog 时显示原图链接；缺少 ResizeObserver / IntersectionObserver 时页面可用。
- 减少动态效果时返回顶部正常；键盘页签、目录展开和表格滚动可用。
- XML RSS 无解析错误，主题可切换，首页保持最近 30 篇全文订阅。
- 禁用 JavaScript 时仍有完整文章清单、初始日历、标签与年份锚点。

## 持续检查与范围

GitHub Actions 的 Build 步骤已加入 `scripts/check_site.py public`，检查失败会阻止后续发布步骤。
校验脚本只使用 Python 标准库，不发送网络请求；已通过故意破坏链接、SRI 与 XML 的反向验证。
工作流 YAML、draft 触发分支和 gh-pages 发布分支均已核对，部署凭据保持原配置。

本轮没有运行 GitHub 上的真实部署，也没有在实体 Safari/iOS 或 Firefox 上实测。
已覆盖 Chromium、键盘、无 JavaScript、禁用存储及部分旧浏览器 API 缺失的回退行为。

提交时应包含新增的 `themes/ihx/`、`assets/`、`layouts/`、`scripts/` 与所需图片，并包含旧 Even 的删除记录；
本次提交需同时纳入新增源码与删除记录，避免遗漏主题与构建校验脚本。
