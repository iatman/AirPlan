# Archive 顶部背景（2026-10-25）

## 设计与文件

- Light：本地绘制 SVG，黄金矩形、连续四分之一圆弧、淡圆和辅助线。无文字，主要形状在右侧约三分之一。
  源文件：`themes/ihx/assets/branding/archive/archive-light.svg`，约 1KB。
- Dark：使用 imagegen 技能的内置图片工具生成水墨画。月下山水、远行侠客、酒葫芦，左侧大面积留白。
  源文件：`themes/ihx/assets/branding/archive/archive-dark.png`。
  图像原始输出保留在 `/home/atman/.codex/generated_images/01a16c47-2d51-7a11-be65-acbe4e3031da/exec-d6e28148-c292-4fd6-b6ed-1f9b98d8f64a.png`。

Light 的图形与当前首页的几何语言一致，作为确定性矢量绘制；Dark 使用内置 image_gen，未使用 API/CLI 备用流程。

## Dark 完整生成提示词

```text
Use case: stylized-concept. Asset type: extremely wide, quiet website archive header background, approximately 3:1 panorama. Scene: minimal Chinese shuimo ink-wash night landscape inspired by the wandering swordsman and poetic freedom of Li Bai's Xia Ke Xing / Bring in the Wine. Deep charcoal-green backdrop exactly close to #111917. Only on the far-right third: a faint misty mountain ridge, a tiny solitary swordsman in a flowing robe and bamboo hat standing on a low riverbank beside a small wine gourd, looking into distant mountain mist; a delicate small pale moon high on the right. Restrained hand-brushed ink textures and a few soft washes, not realistic photography, not 3D. Colors muted gray-green and subdued warm ivory. Composition: left 60% almost empty dark-green negative space for overlaid archive heading; all subjects very small, concentrated within right 35%; lower and left edges dissolve into the flat dark-green background. Quiet, sparse, low contrast and understated, with most of the canvas empty. Do not include text, poetry, calligraphy, logos, stamps, red seals, frames, borders, dense stars, detailed foreground foliage, dramatic lighting, fighting, bright white paper, or website UI. The result is only a decorative landscape artwork, not a complete webpage.
```

## 集成

`themes/ihx/layouts/partials/archive-intro.html` 只在 Archive 页调用，保留原标题和说明文字。
CSS 为两种模式分别选择背景；图片在文字后方，左侧渐变保护正文区域，底部淡出，不进入热力图、标签或文章列表。
手机上减弱背景不透明度、收窄说明文字，并保持图像在右侧。

Dark 源 PNG 只用于 Hugo 构建，输出 800px / 1200px 的 WebP（q78），大小分别约 5KB / 9.7KB。
浏览器根据像素密度选择一张。原 PNG 不发布；Light 只加载 SVG，不请求 Dark 位图。
资源 URL 含指纹或 Hugo 图像处理标识。其他页面不包含这段样式，也不请求这些资源。

## 验证

- Hugo 压缩构建通过。
- 检查 320、390、800、1024、1440px 亮暗布局，标题区域与页签/正文不重叠，无整页横向溢出。
- 浏览器请求验证：初始只加载当前风格的一张背景，切换主题后原位替换；首页与文章页无 Archive 背景请求。
- 热力图、标签切换正常，装饰层 aria-hidden 且不接收鼠标事件。
