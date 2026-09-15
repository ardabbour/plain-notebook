import { escapeHtml as e } from './markdown.js';
import { getMessages } from './i18n.js';

const paths = {
  book: '<path d="M12 7c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V6c-3-1-6-1-9 1Z"/><path d="M12 7v14M7 3h10"/>',
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  page: '<path d="M5 3h9l5 5v13H5Z"/><path d="M14 3v6h5M8 13h8M8 17h6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
};
export const icon = name => `<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.page}</svg>`;

export function renderPage(page, pages, config, assets) {
  const locale = config.locales[page.locale];
  const ui = getMessages(page.locale, config);
  const home = pages.find(p => p.locale === page.locale && p.slug === '');
  const localPages = pages.filter(p => p.locale === page.locale);
  const children = slug => localPages.filter(p => p.slug && p.parent === slug).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, page.locale));
  const navLink = p => `<a href="${e(p.url)}"${p.url === page.url ? ' aria-current="page"' : ''}>${icon(p.slug ? 'page' : 'home')}<span>${e(p.navTitle || p.title)}</span></a>`;
  const navTree = slug => children(slug).map(p => {
    const nested = children(p.slug);
    return nested.length
      ? `<li><details class="nav-group"${page.slug === p.slug || page.slug.startsWith(`${p.slug}/`) ? ' open' : ''}><summary>${e(p.navTitle || p.title)}</summary><ul><li>${navLink(p)}</li>${navTree(p.slug)}</ul></details></li>`
      : `<li>${navLink(p)}</li>`;
  }).join('');
  const ancestors = [];
  let parent = page.parent;
  while (parent) {
    const p = localPages.find(p => p.slug === parent);
    if (!p) break;
    ancestors.unshift(p);
    parent = p.parent;
  }
  const translations = Object.entries(config.locales).map(([code, lang]) => {
    const translation = pages.find(p => p.locale === code && p.translationKey === page.translationKey);
    if (translation) return `<li><a href="${e(translation.url)}" lang="${e(code)}" dir="${lang.dir}" hreflang="${e(code)}"${code === page.locale ? ' aria-current="true"' : ''}>${e(lang.label)}</a></li>`;
    const start = pages.find(p => p.locale === code && !p.slug);
    return `<li><span aria-disabled="true"><bdi lang="${e(code)}">${e(lang.label)}</bdi><small>${e(ui.unavailable)}</small></span>${start ? `<a class="language-fallback" href="${e(start.url)}">${e(ui.browse)}: <bdi>${e(lang.label)}</bdi></a>` : ''}</li>`;
  }).join('');
  const headings = (page.headings || []).filter(h => h.level === 2);
  const outline = page.toc !== false && headings.length > 1;
  const absolute = path => config.url ? `${config.url}${path}` : '';
  const alternatives = config.url ? pages.filter(p => p.translationKey === page.translationKey).map(p => `<link rel="alternate" hreflang="${e(p.locale)}" href="${e(absolute(p.url))}">`).join('') : '';
  const guide = localPages.find(p => p.translationKey === 'markdown');
  const related = children(page.slug);
  return `<!doctype html>
<html lang="${e(page.locale)}" dir="${locale.dir}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${e(page.slug ? `${page.title} · ${locale.name}` : locale.name)}</title>
<meta name="description" content="${e(page.description || locale.description)}">
${page.notFound ? '<meta name="robots" content="noindex">' : config.url ? `<link rel="canonical" href="${e(absolute(page.url))}">${alternatives}` : ''}
<meta property="og:title" content="${e(page.title)}"><meta property="og:description" content="${e(page.description || locale.description)}"><meta property="og:type" content="website">
<link rel="icon" href="${e(config.basePath)}/favicon.svg" type="image/svg+xml">
<script>try{const t=localStorage.getItem('notebook-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}</script>
<link rel="stylesheet" href="${e(assets.css)}"><script type="module" src="${e(assets.js)}"></script>
</head>
<body id="top">
<a class="skip-link" href="#content">${e(ui.skip)}</a>
<div class="shell">
  <aside class="sidebar">
    <a class="identity" href="${e(home.url)}">${icon('book')}<span>${e(locale.name)}</span></a>
    <p class="tagline">${e(locale.tagline)}</p>
    <details class="page-navigation" open>
      <summary>${e(ui.pages)}</summary>
      <nav aria-label="${e(ui.navigation)}">
        <p class="nav-label">${e(ui.pages)}</p>
        <ul class="page-tree"><li>${navLink(home)}</li>${navTree('')}</ul>
      </nav>
    </details>
    <div class="sidebar-bottom"><p>${e(locale.footer)}</p>${guide ? `<a href="${e(guide.url)}">${e(ui.example)}</a>` : ''}</div>
  </aside>
  <div class="workspace">
    <header class="toolbar">
      <nav class="breadcrumbs" aria-label="${e(ui.navigation)}"><a href="${e(home.url)}">${e(ui.home)}</a>${ancestors.map(p => `<span aria-hidden="true">/</span><a href="${e(p.url)}">${e(p.navTitle || p.title)}</a>`).join('')}${page.slug ? `<span aria-hidden="true">/</span><span aria-current="page">${e(page.navTitle || page.title)}</span>` : ''}</nav>
      <div class="preferences">
        <details class="language-picker"><summary aria-label="${e(ui.language)}: ${e(locale.label)}">${icon('globe')}<span>${e(locale.label)}</span></summary><ul aria-label="${e(ui.language)}">${translations}</ul></details>
        <label class="theme-picker" hidden data-enhancement>${icon('sun')}<span class="sr-only">${e(ui.appearance)}</span><select id="theme" aria-label="${e(ui.appearance)}"><option value="system">${e(ui.system)}</option><option value="light">${e(ui.light)}</option><option value="dark">${e(ui.dark)}</option></select></label>
      </div>
    </header>
    <div class="reading-layout${outline ? ' has-outline' : ''}">
      <main id="content" tabindex="-1">
        <div class="search" hidden data-enhancement data-index="${e(config.basePath)}/${e(page.locale)}/search.json" data-messages="${e(JSON.stringify({ loading: ui.loading, empty: ui.noResults, error: ui.searchError, results: ui.results, hint: ui.searchHint }))}">
          <label for="search-input">${icon('search')}<span class="sr-only">${e(ui.search)}</span></label><input id="search-input" type="search" placeholder="${e(ui.searchPlaceholder)}" autocomplete="off" aria-controls="search-results" aria-describedby="search-status"><kbd aria-hidden="true">/</kbd>
          <div class="search-panel" hidden><p id="search-status" role="status">${e(ui.searchHint)}</p><ul id="search-results"></ul></div>
        </div>
        <article class="${page.slug ? '' : 'home-page'}">
          <header class="page-header"><h1>${e(page.title)}</h1>${page.description && page.slug ? `<p class="page-description">${e(page.description)}</p>` : ''}${page.date ? `<p class="page-meta"><time datetime="${e(page.date)}">${e(new Intl.DateTimeFormat(page.locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(page.date)))}</time><span aria-hidden="true">·</span>${page.readingTime} ${e(ui.minute)}</p>` : ''}</header>
          <div class="prose">${page.html}</div>
          ${related.length && page.showChildren !== false ? `<section class="child-pages" aria-label="${e(ui.related)}">${related.map(p => `<a href="${e(p.url)}"><span><strong>${e(p.title)}</strong><small>${e(p.description || '')}</small></span>${icon('arrow')}</a>`).join('')}</section>` : ''}
        </article>
        <footer class="page-footer"><span>${e(locale.name)}</span><a href="#top">${e(ui.back)} <span aria-hidden="true">↑</span></a></footer>
      </main>
      ${outline ? `<aside class="outline"><nav aria-label="${e(ui.onThisPage)}"><p>${e(ui.onThisPage)}</p><ul>${headings.map(h => `<li><a href="#${e(h.id)}">${e(h.title)}</a></li>`).join('')}</ul></nav></aside>` : ''}
    </div>
  </div>
</div>
</body></html>`;
}
