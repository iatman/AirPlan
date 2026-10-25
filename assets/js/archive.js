(() => {
  const archive = document.getElementById('archive');
  if (!archive) return;

  const filters = archive.querySelector('.archive-filters');
  const tagLinks = [...filters.querySelectorAll('[data-archive-tag]')];
  const results = archive.querySelector('.archive-results');
  const groups = [...results.querySelectorAll('.archive-year-group')];
  const articles = [...results.querySelectorAll('[data-archive-tags]')].map(element => ({
    element,
    tags: JSON.parse(element.dataset.archiveTags),
    date: element.dataset.archiveDate,
    title: element.querySelector('.archive-post-link').textContent
  }));
  const dates = new Map();
  articles.forEach(article => {
    if (!dates.has(article.date)) dates.set(article.date, []);
    dates.get(article.date).push(article);
  });
  const years = groups.map(group => {
    const heading = group.querySelector('.archive-year');
    const link = archive.querySelector(`a[href="#${heading.id}"]`);
    return { group, heading, link, count: link.querySelector('.archive-year-count') };
  });
  const counter = archive.querySelector('.archive-post-counter');
  const status = archive.querySelector('.archive-filter-status');
  const clear = archive.querySelector('.archive-clear-filter');
  const tabs = [...archive.querySelectorAll('[data-archive-view]')];
  const grid = archive.querySelector('#archive-heatmap-grid');
  const yearSelect = archive.querySelector('#archive-heatmap-year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = { kind: 'all', value: '' };
  let animation;

  function updateActiveYear() {
    const visible = years.filter(year => !year.group.hidden);
    let active = visible[0];
    visible.forEach(year => {
      if (year.heading.getBoundingClientRect().top <= 72) active = year;
    });
    years.forEach(year => {
      if (year === active) year.link.setAttribute('aria-current', 'location');
      else year.link.removeAttribute('aria-current');
    });
  }
  function updateYears() {
    years.forEach(year => {
      year.link.parentElement.hidden = year.group.hidden;
      year.count.textContent = year.group.querySelectorAll('.archive-post:not([hidden])').length;
    });
    updateActiveYear();
  }
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(() => { scrollQueued = false; updateActiveYear(); });
  }, { passive: true });
  window.addEventListener('resize', updateActiveYear);
  window.addEventListener('pageshow', updateActiveYear);

  function applyFilter(kind = 'all', value = '', label = '') {
    selected = { kind, value };
    let count = 0;
    articles.forEach(({ element, tags, date }) => {
      element.hidden = kind === 'tag' ? !tags.includes(value) : kind === 'date' ? date !== value : false;
      if (!element.hidden) count++;
    });
    groups.forEach(group => { group.hidden = !group.querySelector('.archive-post:not([hidden])'); });
    updateYears();
    tagLinks.forEach(link => {
      const active = kind === 'tag' ? link.dataset.archiveTag === value : link.dataset.archiveTag === '';
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    grid.querySelectorAll('button[data-date]').forEach(day => {
      day.setAttribute('aria-pressed', String(kind === 'date' && day.dataset.date === value));
    });
    if (counter) counter.hidden = kind !== 'all';
    clear.hidden = kind === 'all';
    status.textContent = kind === 'tag' ? `标签：${label} · ${count} 篇文章`
      : kind === 'date' ? `${value} · ${count} 篇文章` : '';
    if (animation) animation.cancel();
    if (!reduceMotion.matches && results.animate) {
      animation = results.animate(
        [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 200, easing: 'ease-out' }
      );
    }
  }

  filters.addEventListener('click', event => {
    const link = event.target.closest('[data-archive-tag]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const value = link.dataset.archiveTag;
    if (value === '') applyFilter();
    else if (selected.kind !== 'tag' || selected.value !== value) {
      applyFilter('tag', value, link.childNodes[0].textContent.trim());
    }
  });
  clear.addEventListener('click', () => {
    applyFilter();
    tabs.find(tab => tab.getAttribute('aria-selected') === 'true').focus({ preventScroll: true });
  });

  function activateTab(tab) {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    // Each view has one filter, so hidden controls never constrain the list.
    if (selected.kind !== 'all') applyFilter();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[next]);
      tabs[next].focus();
    });
  });

  function renderHeatmap() {
    const year = Number(yearSelect.value);
    const dayMs = 86400000;
    const first = Date.UTC(year, 0, 1);
    const last = Date.UTC(year, 11, 31);
    const start = first - new Date(first).getUTCDay() * dayMs;
    const weeks = Math.ceil(((last - start) / dayMs + 1) / 7);
    const today = new Date().toISOString().slice(0, 10);
    const fragment = document.createDocumentFragment();
    let published = 0;
    let recordedDays = 0;
    grid.style.setProperty('--heatmap-weeks', weeks);
    for (let month = 0; month < 12; month++) {
      const week = Math.floor((Date.UTC(year, month, 1) - start) / dayMs / 7);
      const label = document.createElement('span');
      label.className = 'heatmap-month';
      label.textContent = `${month + 1}月`;
      label.style.gridColumn = `${week + 2} / span ${Math.min(3, weeks - week)}`;
      label.style.gridRow = '1';
      fragment.append(label);
    }
    ['日', '一', '二', '三', '四', '五', '六'].forEach((text, day) => {
      if (day !== 1 && day !== 3 && day !== 5) return;
      const label = document.createElement('span');
      label.className = 'heatmap-weekday';
      label.textContent = text;
      label.title = `星期${text}`;
      label.style.gridColumn = '1';
      label.style.gridRow = String(day + 2);
      fragment.append(label);
    });
    for (let index = 0; index < weeks * 7; index++) {
      const time = start + index * dayMs;
      const date = new Date(time).toISOString().slice(0, 10);
      const inside = time >= first && time <= last;
      const dayArticles = inside ? dates.get(date) || [] : [];
      const count = dayArticles.length;
      const day = document.createElement(count ? 'button' : 'span');
      day.className = 'heatmap-day';
      day.dataset.level = String(Math.min(4, count));
      day.style.gridColumn = String(Math.floor(index / 7) + 2);
      day.style.gridRow = String(index % 7 + 2);
      if (!inside) {
        day.classList.add('is-outside');
        day.setAttribute('aria-hidden', 'true');
      } else {
        day.title = `${date} · ${count} 篇文章${count ? '\n' + dayArticles.map(article => article.title).join('\n') : ''}`;
        if (date > today && !count) day.classList.add('is-future');
        if (count) {
          day.type = 'button';
          day.dataset.date = date;
          day.setAttribute('aria-label', `${date}，${count} 篇文章，筛选当日行记`);
          day.setAttribute('aria-pressed', String(selected.kind === 'date' && selected.value === date));
          published += count;
          recordedDays++;
        } else {
          day.setAttribute('aria-hidden', 'true');
        }
      }
      fragment.append(day);
    }
    grid.replaceChildren(fragment);
    archive.querySelector('#archive-heatmap-summary').textContent = `${year} 年 · ${published} 篇行记 · ${recordedDays} 个记录日`;
    grid.parentElement.setAttribute('aria-label', `${year} 年文章热力图，${published} 篇文章，窄屏可左右滚动`);
  }
  yearSelect.addEventListener('change', () => {
    if (selected.kind === 'date') applyFilter();
    renderHeatmap();
    grid.parentElement.scrollLeft = 0;
  });
  grid.addEventListener('click', event => {
    const day = event.target.closest('button[data-date]');
    if (!day) return;
    if (selected.kind === 'date' && selected.value === day.dataset.date) applyFilter();
    else applyFilter('date', day.dataset.date);
  });
  renderHeatmap();
  updateYears();
})();
