// Reading and navigation are static HTML. These controls are optional enhancements.
document.querySelectorAll('[data-enhancement]').forEach(el => { el.hidden = false; });

const pageNavigation = document.querySelector('.page-navigation');
const compact = matchMedia('(max-width: 800px)');
const adaptNavigation = () => { if (pageNavigation) pageNavigation.open = !compact.matches; };
adaptNavigation();
compact.addEventListener('change', adaptNavigation);

const theme = document.querySelector('#theme');
if (theme) {
  try { theme.value = ['light', 'dark'].includes(localStorage.getItem('notebook-theme')) ? localStorage.getItem('notebook-theme') : 'system'; } catch { /* System follows CSS when storage is unavailable. */ }
  theme.addEventListener('change', () => {
    if (theme.value === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme.value;
    try { localStorage.setItem('notebook-theme', theme.value); } catch { /* This visit still works. */ }
  });
}

const languages = document.querySelector('.language-picker');
document.addEventListener('click', event => {
  if (languages && !languages.contains(event.target)) languages.open = false;
});

const search = document.querySelector('.search');
if (search) {
  const input = search.querySelector('input');
  const panel = search.querySelector('.search-panel');
  const status = search.querySelector('[role="status"]');
  const results = search.querySelector('ul');
  const messages = JSON.parse(search.dataset.messages);
  const normalize = text => text.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase(document.documentElement.lang);
  let indexPromise;
  let revision = 0;
  async function update() {
    const current = ++revision;
    results.replaceChildren();
    const query = normalize(input.value.trim());
    panel.hidden = !query;
    if (!query) return;
    status.textContent = messages.loading;
    try {
      indexPromise ||= fetch(search.dataset.index).then(response => {
        if (!response.ok) throw new Error('Search index unavailable');
        return response.json();
      }).catch(error => { indexPromise = undefined; throw error; });
      const pages = await indexPromise;
      if (current !== revision) return;
      const terms = query.split(/\s+/);
      const matches = pages.map(page => ({
        ...page,
        score: terms.every(term => normalize(`${page.title} ${page.description} ${page.text}`).includes(term))
          ? (normalize(page.title).includes(query) ? 3 : normalize(page.description).includes(query) ? 2 : 1) : 0,
      })).filter(page => page.score).sort((a, b) => b.score - a.score);
      status.textContent = matches.length ? `${new Intl.NumberFormat(document.documentElement.lang).format(matches.length)} ${messages.results}` : messages.empty;
      for (const page of matches.slice(0, 12)) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = page.url;
        const title = document.createElement('strong');
        title.textContent = page.title;
        const description = document.createElement('small');
        description.textContent = page.description;
        link.append(title, description);
        item.append(link);
        results.append(item);
      }
    } catch {
      if (current === revision) status.textContent = messages.error;
    }
  }
  input.addEventListener('input', update);
  input.addEventListener('focus', () => { if (input.value.trim()) update(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' && results.querySelector('a')) {
      event.preventDefault(); results.querySelector('a').focus();
    }
  });
  document.addEventListener('click', event => {
    if (!search.contains(event.target)) { panel.hidden = true; revision++; }
  });
  document.addEventListener('keydown', event => {
    const editing = event.target.closest('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault(); input.focus();
    }
    if (event.key === 'Escape') {
      if (!panel.hidden) { input.focus(); panel.hidden = true; revision++; }
      if (languages?.open) { languages.open = false; languages.querySelector('summary').focus(); }
    }
  });
}
