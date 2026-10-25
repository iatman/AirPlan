# 正文与引用排版（2026-10-25）

## 参考背景

[Chongxi 的博客设计文章](https://xice.cx/posts/myBlogDesign/) 将灵感指向 NASA 七十年代至九十年代初的纸质文档：
借助网格、对齐、信息层级与留白，让阅读和查找更清晰。本文将其理解为功能性排版的参考。

[NASA 1976 Graphics Standards Manual](https://www.nasa.gov/wp-content/uploads/2015/01/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf)
第 5.3–5.6 节分别列出无衬线与衬线字体，并讨论长篇出版物的字体和标题搭配。
[NASA 2005 Publications Guide](https://ntrs.nasa.gov/api/citations/20050189209/downloads/20050189209.pdf)
第 4.3.1.7 节也按标题、图表和正文区分字体用途。
本次借鉴层级和留白，网页字号、中文字体及响应式布局采用本站自己的设置。

## 本站调整

- 正文：系统无衬线字体。macOS 优先系统字体/PingFang，Windows 使用 Segoe UI / 微软雅黑，其他系统使用可用的 Arial、Noto Sans CJK 或系统 sans-serif。
- 引用：Georgia / Times New Roman 搭配宋体类中文字体（Songti SC、STSong、SimSun、Noto Serif CJK），保持正体，不把中文整块设为斜体。
- 代码：系统等宽字体，如 SFMono、Consolas、Menlo、Liberation Mono，不继承正文的字距。
- 所有字体均使用本机 CSS 字体栈，无新字体文件、@font-face 或字体 CDN。不同操作系统的最终字形由其已安装字体决定；缺少宋体时允许系统回退。
- 桌面正文 17px、手机 16px，行高 1.95；文章区域最大宽度 760px。
- 正文段落间距 1.2em，相邻列表项增加 .5em，嵌套列表保持稍紧的层级关系。
- 引用保留浅背景与左边线，字号约为正文的 1.04 倍，独立段落之间保留 1em；嵌套引用不逐层放大字号。
- 代码行高由实际计算出的 13px 修为 22.75px（13px × 1.75），行号与源码保持一致。
- 标题、引用、正文、代码保持各自职责，沿用现有亮暗配色。

## 验证

Hugo 压缩构建通过。检查了周记、技术文、宽表格和 About 在 320、390、800、1024、1440px 下的亮暗模式。
正文与引用的字体栈不同；多段引用有间距；代码换行前后文本一致，行号与源码行高一致。
网络检查仅发现原有图标字体，未发现正文或引用新增字体请求。
