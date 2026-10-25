(() => {
  const root = document.documentElement;
  const key = 'atman-color-scheme';
  const valid = value => value === 'light' || value === 'dark';
  const fallback = root.getAttribute('data-theme-default') === 'light' ? 'light' : 'dark';
  let preferred;
  try { preferred = localStorage.getItem(key); } catch (_) { /* Storage is optional. */ }

  function apply(theme) {
    root.setAttribute('data-theme', valid(theme) ? theme : fallback);
    const dark = root.getAttribute('data-theme') === 'dark';
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.content = dark ? '#111917' : '#e6e3d9';
    const scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.content = root.getAttribute('data-theme');
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? '切换为亮色模式' : '切换为暗色模式';
    }
  }

  // Run in the head, before stylesheets, to avoid painting the wrong appearance.
  apply(preferred);
  root.setAttribute('data-theme-ready', 'true');
  document.addEventListener('DOMContentLoaded', () => apply(root.getAttribute('data-theme')));
  document.addEventListener('click', event => {
    if (!event.target.closest('#theme-toggle')) return;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(key, next); } catch (_) { /* The current page still switches. */ }
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue);
  });
})();
