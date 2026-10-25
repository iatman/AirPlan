# 项目维护文档

这里保存主题维护、设计与调研说明，不属于 Hugo 的 content 目录，不生成网站页面。

## 常用维护

- [主题配置与 Archive](theme-switching.md)：默认风格、亮暗切换、年份目录、热力图及页签。
- [标签使用约定](tag-guide.md)：新增文章时如何选标签、避免同义词和版本号膨胀。
- [标签迁移清单](tag-migration.md)：已有标签的归并记录。
- [提交前检查](preflight-review.md)：构建、资源、RSS 和浏览器验证范围。

## 排版与设计

- [阅读排版](reading-typography.md)：系统字体、正文/引用区分、段落与代码行距。
- [阅读检查记录](reading-review.md)：对比度、表格滚动和代码控制的检查依据。
- [几何构图](light-geometry.md)：字标、圆环及几何元素的设计逻辑。
- [Archive 背景](archive-art.md)、[导航图案](nav-art.md)、[About 配图](about-art.md)：资源位置与后续重制依据。

## 暂存方案

- [阅览架调研](shelf-research.md)：方案、字段约定、Hugo 兼容性验证及候选数据；当前暂不实施。
- 独立 Demo 位于项目外，不随本站源码或静态页面发布。

日常验证从项目根目录运行：

```sh
hugo --minify
python3 scripts/check_site.py public
```
