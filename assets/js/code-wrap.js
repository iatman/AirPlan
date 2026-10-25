(() => {
  const blocks = new Set();
  document.querySelectorAll('.post-content pre').forEach(pre => {
    blocks.add(pre.closest('.highlight') || pre);
  });

  [...blocks].forEach((block, index) => {
    if (block.closest('.code-wrap-block')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrap-block';
    block.before(wrapper);
    wrapper.append(block);
    if (!block.id) block.id = `code-wrap-${index}`;

    const toolbar = document.createElement('div');
    toolbar.className = 'code-wrap-toolbar';
    const label = document.createElement('span');
    label.className = 'code-wrap-label';
    const code = block.querySelector('code[data-lang], code[class*="language-"]');
    const languageClass = code && [...code.classList].find(name => name.startsWith('language-'));
    label.textContent = (code && code.dataset.lang) || (languageClass && languageClass.slice(9)) || 'CODE';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-wrap-toggle';
    button.textContent = '换行展示';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-controls', block.id);
    button.title = '切换代码自动换行；换行时隐藏行号';
    button.addEventListener('click', () => {
      const wrapped = wrapper.classList.toggle('code-is-wrapped');
      button.setAttribute('aria-pressed', String(wrapped));
      button.textContent = wrapped ? '取消换行' : '换行展示';
    });
    toolbar.append(label, button);
    wrapper.prepend(toolbar);
  });
})();
