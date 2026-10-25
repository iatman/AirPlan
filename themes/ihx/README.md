# IHX：单一本地主题，两种风格

所有模板、基础样式、图标字体、翻译与品牌资源均位于 `themes/ihx/`。
已合入原 Even 底座，不再依赖 `themes/even/`，亮暗两种风格共享一套内容和交互。

```toml
theme = "ihx"

[params]
colorScheme = "dark" # dark / light，首次访问的默认风格
```

Hugo 的查找顺序是：项目根目录 → `themes/ihx/`，项目级定制仍优先。
亮色使用 IHX 的暖灰纸色/深墨绿/暖金配色，暗色使用 IHX 的墨绿/暗金配色。

## 切换行为

- 页头太阳/月亮按钮原地切换配色，不刷新页面。
- 访客选择保存在当前域名的 localStorage（`atman-color-scheme`），刷新和切页继续生效。
- 访客选择优先于配置默认值；没有有效本地偏好时使用 `params.colorScheme`。
- 同一域名的其他标签页会同步选择。存储不可用时仍可切换当前页面。
- 初始化脚本在样式表之前执行，减少错误配色的首屏闪烁。
- 无 JavaScript 时使用配置默认风格，切换按钮隐藏。
- RSS 保持标准 XML；浏览器视图与网页读取同一份本地偏好，支持切换与跨标签页同步；订阅正文保持完整。

## 开发

```sh
hugo --minify
python3 scripts/check_site.py public # 从项目根目录验证生成文件
hugo server --bind 0.0.0.0 --baseURL http://192.168.101.221:1313/ --port 1313 --disableFastRender
```

迁移主题目录或配置后应重启开发服务器。构建和预览只需 Hugo，不需要 npm、webpack 或 `node_modules`。
`src/`、`webpack.config.js` 等保留了原基础资源的源码与可选构建配置；日常修改在 `assets/css/ihx.css` 中完成。

## 主要文件

- `assets/css/ihx.css`：共用布局、两套颜色变量、主题按钮；Hugo 压缩并生成指纹 URL。
- 项目根目录 `assets/css/feed.css`：RSS 浏览器样式，与网页保持相同亮暗配色，输出指纹 URL。
- 项目根目录 `assets/js/theme.js`：共用主题逻辑；HTML 首屏内联执行，RSS 浏览器视图加载指纹脚本。
- `layouts/_default/baseof.html`：统一页面框架。
- `layouts/partials/header.html`：字标、I/H/X 导航、主题按钮。
- `layouts/partials/landscape.html`：暗色内联山水 SVG。
- `layouts/partials/geometric-mark.html`：亮色页头 ihx 轮廓字标、正圆与光点 SVG，无字体或图片请求。
- `layouts/partials/euclidean-study.html`：首页左侧双圆作等边三角形（欧几里得 I.1）。
- `layouts/partials/geometric-field.html`：左图与 SQL 卡片之间的淡几何背景。
- `assets/js/ihx.js`：原生图片查看器、文章目录高亮与表格滚动增强；输出指纹 URL。
- `layouts/post/`、`layouts/look/`、`layouts/_default/`：文章和标签等页面模板。
- `layouts/partials/post/article.html`：Post/Look 共用的文章布局；标签置顶并自动换行，底部导航显示方向与完整文章标题，小屏纵向排列。
- `static/dist/`、`i18n/`：已合入的基础 CSS、图标字体与翻译。
- `data/even/assets.json`：历史资源清单，名称仅用于定位本目录的 CSS，不代表外部主题依赖。
- `src/`：原基础样式、字体及脚本源码。

项目根目录的 `layouts/`、`assets/` 和 `static/` 维护共同的 Archive、RSS、404、代码换行及返回顶部。
Archive 年份目录有稳定锚点；桌面在右侧停留，窄屏置于列表上方；按标签筛选时同步可用年份和数量。

## 品牌

身份：**atman.ihx.cc**。题辞：**君子不器 · 日日自新**。
`atman` 是向内的心法（內觀其心），`ihx.cc` 是向外的行路（行於江湖）。字标旁的开环、
剑线与光点呼应循环、守护和未完成的探索。页头字标使用文字及内联 SVG，不额外下载图片。

亮色以 ihx 为主、atman 为署名，以抽象几何、圆弧和光点表达观察、求知与实践；桌面保留 SQL 卡片，800px 及以下隐藏。
暗色延续内观、守护与行路的山水气质。两者共享内容与功能。

使用系统字体；背景山水为 SVG。About 配图和导航图案通过 Hugo 输出压缩 WebP。
生成素材及提示词记录在仓库根目录 `docs/about-art.md`、`docs/nav-art.md`。

jQuery、slideout 和 fancybox 不在当前运行时加载。图片放大、主题切换等交互使用原生 JavaScript。
未启用的第三方流程图插件不加载；MathJax 仍按配置加载。

## 许可

基于 [Even](https://github.com/olOwOlo/hugo-theme-even)，其来源为 hexo-theme-even。
保留原 MIT 许可和来源说明，见 `LICENSE.md`。
