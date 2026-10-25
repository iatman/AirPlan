(() => {
  const button = document.getElementById('back-to-top-control');
  if (!button) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let anchorY = Math.max(0, window.scrollY);
  let queued = false;
  let returning = false;

  function setVisible(visible) {
    button.classList.toggle('is-visible', visible);
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
  }

  function update() {
    queued = false;
    const y = Math.max(0, window.scrollY);
    const threshold = Math.min(2000, window.innerHeight);
    const delta = y - anchorY;

    if (y <= threshold) {
      setVisible(false);
      returning = false;
      anchorY = y;
      return;
    }
    // Ignore small touchpad movements so the button does not flicker.
    if (Math.abs(delta) < 8) return;
    if (returning && delta > 0) returning = false;
    setVisible(!returning && delta < 0);
    anchorY = y;
  }

  window.addEventListener('scroll', () => {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);

  button.addEventListener('click', () => {
    returning = true;
    setVisible(false);
    button.blur();
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
})();
