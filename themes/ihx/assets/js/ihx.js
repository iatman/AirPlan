(() => {
  // A native image viewer replaces the previous jQuery/fancybox bundle.
  const images = [...document.querySelectorAll('.post-content img')];
  const supportsDialog = typeof document.createElement('dialog').showModal === 'function';
  if (images.length && supportsDialog) {
    const viewer = document.createElement('dialog');
    viewer.className = 'ihx-image-viewer';
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'viewer-close'; close.textContent = '×'; close.setAttribute('aria-label', '关闭图片');
    const image = document.createElement('img');
    const caption = document.createElement('p');
    viewer.setAttribute('aria-label', '图片预览');
    viewer.append(close, image, caption); document.body.append(viewer);
    close.addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    images.forEach(source => {
      const link = source.closest('a');
      // Keep linked illustrations and diagrams that navigate elsewhere unchanged.
      if (link) return;
      source.classList.add('can-enlarge');
      const trigger = document.createElement('button');
      trigger.type = 'button'; trigger.className = 'image-trigger';
      trigger.setAttribute('aria-label', `放大图片：${source.alt || '文章配图'}`);
      source.before(trigger); trigger.append(source);
      trigger.addEventListener('click', () => { image.src = source.currentSrc || source.src; image.alt = source.alt; caption.textContent = source.alt; viewer.showModal(); });
    });
  }
  if (!supportsDialog) images.forEach(source => {
    if (source.closest('a')) return;
    const link = document.createElement('a');
    link.className = 'image-trigger';
    link.href = source.currentSrc || source.src;
    link.setAttribute('aria-label', `查看原图：${source.alt || '文章配图'}`);
    source.before(link);
    link.append(source);
  });
  // Keep wide data tables readable, with touch and keyboard scrolling.
  const tables = [...document.querySelectorAll('.post-content table')]
    .filter(table => !table.closest('.highlight, .reading-table'));
  const regions = tables.map(table => {
    const region = document.createElement('div');
    region.className = 'reading-table';
    const hint = document.createElement('p');
    hint.className = 'table-scroll-hint';
    hint.textContent = '表格可左右滑动 · 键盘可用左右方向键';
    hint.hidden = true;
    const scroll = document.createElement('div');
    scroll.className = 'table-scroll';
    table.before(region);
    region.append(hint, scroll);
    scroll.append(table);
    return { table, scroll, hint };
  });
  const updateTables = () => regions.forEach(({ scroll, hint }) => {
    const wide = scroll.scrollWidth > scroll.clientWidth + 1;
    hint.hidden = !wide;
    if (wide) {
      scroll.tabIndex = 0;
      scroll.setAttribute('role', 'region');
      scroll.setAttribute('aria-label', '表格，可左右滚动');
    } else {
      scroll.removeAttribute('tabindex');
      scroll.removeAttribute('role');
      scroll.removeAttribute('aria-label');
    }
  });
  if (regions.length) {
    updateTables();
    if ('ResizeObserver' in window) {
      const tableObserver = new ResizeObserver(updateTables);
      regions.forEach(({ table, scroll }) => {
        tableObserver.observe(table);
        tableObserver.observe(scroll);
      });
    } else {
      window.addEventListener('resize', updateTables, { passive: true });
    }
  }
  const toc = document.getElementById('TableOfContents');
  if (toc && 'IntersectionObserver' in window) {
    const links = [...toc.querySelectorAll('a')];
    const headings = links.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => link.classList.toggle('active', decodeURIComponent(link.hash.slice(1)) === entry.target.id));
      });
    }, { rootMargin: '-5% 0px -70% 0px' });
    headings.forEach(heading => observer.observe(heading));
  }
})();
