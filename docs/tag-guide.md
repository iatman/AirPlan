# 标签维护约定

标签用于跨文章检索主题。优先选择已有标签，每篇建议保留 2～4 个有明确用途的标签；数量是建议，不为凑数增加标签，也不机械删除有用的技术关键词。

- 产品名称使用固定拼写，例如 `TiDB`、`StarRocks`、`Kubernetes`、`HAProxy`、`MinIO`、`S3`。
- 同义词和大小写遵循 [归并规则](../scripts/tag-rules.json)。例如 `K8S`、`kubernetes` 统一为 `Kubernetes`，`deploy` 统一为 `Deploy`。
- 版本信息写入标题或正文，不另建版本标签。已有 `TiDB 2.0` 标签改为 `TiDB`，原版本信息保留在文章开头。
- 工具和协议保留各自检索用途。`s3cmd`、`s3fs` 保留工具标签，同时使用共同的 `S3` 主题标签；不将不同工具当成同义词。
- 删除泛化的 `software` / `Software` 和重复目录含义的 `Look`；保留已有的系列、文章形式和具体问题标签，本轮不统一改写这类标签。
- Archive 默认展示至少关联 2 篇文章的标签，按文章数倒序排列。仅关联 1 篇文章的标签放在“更多标签”中，仍可原地筛选。

## 检查与应用

在仓库根目录运行（Python 3，需要 PyYAML）：

```sh
python3 scripts/normalize_tags.py
python3 scripts/normalize_tags.py --write
```

默认只检查，有非规范标签时返回非零状态。`--write` 应用映射、移除冗余项并去重，保留原有标签顺序和正文；版本标签转换时会补充版本说明。新增别名应先编辑规则文件。未列入规则的标签保持原样。

本次标签清单与处理前后频次见 [标签归并清单](tag-migration.md)。
