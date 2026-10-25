# I / H / X 导航图案

- 生成方式：内置 `image_gen`，基于用户提供的三栏参考图编辑；透明背景。
- 保存路径：`themes/ihx/assets/branding/nav-sprite.png`。
- 网页输出：Hugo 将源图缩小为宽 336px 的透明 WebP，约 17 KB。三个导航共用一张图。
- 映射：首页 → I 侠客，行记 → H 驿门，关于 → X 交会与前行。
- 默认显示文字；鼠标悬停或键盘聚焦时显示对应图案。触控设备保留文字。
- 固定菜单宽高，切换不引起位置变化；尊重系统减少动画设置。

## 最终生成提示词

```text
Use case: background-extraction / precise-object-edit. Asset type: ONE horizontal 3-frame sprite strip for three navigation hover icons on a dark wuxia personal blog. Edit target: the attached reference with i (wandering swordsman), h (inn gate with lantern), x (crossed brushstroke paths). Extract and simplify ONLY the three upper illustrations, remove ALL Chinese text, ALL English labels, separator lines, parchment, background, and any captions. Keep the recognizable motifs and left-to-right order: 1 a solitary robed wandering swordsman with a small detached round sun above (evokes i), 2 an h-shaped traditional inn doorway with roof and tiny hanging red lantern, 3 two crossing expressive brushstrokes evoking x with a short winding path. Preserve the reference's restrained Chinese ink brush style, but adapt foreground strokes to light warm ivory and antique muted gold so these icons are legible on a near-black green #111917 website background. Tiny cinnabar red only on the lantern. No black-filled silhouette that disappears on a dark surface. Composition: wide 3:1 canvas, ideally 1536 by 512. Exactly THREE EQUAL SQUARE CELLS in ONE ROW, each illustration entirely inside its own cell, centered at x=1/6, x=1/2, x=5/6 of canvas; consistent scale and height, generous 12% inset in each cell, no overlapping cells and no visible cell boundaries. Strong clear silhouettes readable at 40-48px. Background must be genuine transparent alpha everywhere outside the illustrations, no checkerboard drawn into pixels, no background shadows, no gradients or glow, no extra text, no typography, no watermark. This is a production sprite asset, not a presentation board.
```
