import { readFile, readdir, mkdir, writeFile, cp, rm, rename } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { createMarkdown, escapeHtml } from './markdown.js';
import { renderPage } from './template.js';
import { getMessages } from './i18n.js';

export const root = path.resolve(import.meta.dirname, '..');
export const contentRoot = path.join(root, 'content');
const hash = content => createHash('sha256').update(content).digest('hex').slice(0, 10);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const all = await Promise.all(entries.filter(e => !e.name.startsWith('.')).map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return all.flat();
}

export async function loadConfig(configFile = path.join(root, 'site.config.js'), configOverride = {}) {
  const config = { ...(await import(`${pathToFileURL(configFile)}?v=${Date.now()}`)).default, ...configOverride };
  if (typeof config.basePath !== 'string' || typeof config.url !== 'string') throw new Error('url and basePath must be strings (use an empty string when unset).');
  config.basePath = config.basePath.replace(/\/$/, '');
  config.url = config.url.replace(/\/$/, '');
  if (config.basePath && !/^\/(?:[a-zA-Z0-9_-]+\/?)+$/.test(config.basePath)) throw new Error('basePath must be a path such as /my-notebook');
  if (config.url && !/^https?:\/\/[^/]+$/.test(config.url)) throw new Error('url must be an origin such as https://example.com; use basePath for a subdirectory.');
  if (!config.locales || !Object.hasOwn(config.locales, config.defaultLocale)) throw new Error('defaultLocale must exist in locales.');
  for (const [code, locale] of Object.entries(config.locales)) {
    try { Intl.getCanonicalLocales(code); } catch { throw new Error(`Invalid language tag: ${code}`); }
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(code) || !['ltr', 'rtl'].includes(locale.dir)) throw new Error(`Invalid locale: ${code}`);
    for (const field of ['label', 'name', 'tagline', 'description', 'footer']) {
      if (typeof locale[field] !== 'string') throw new Error(`locales.${code}.${field} must be a string.`);
    }
  }
  return config;
}

export async function build({ outDir = path.join(root, 'dist'), contentDir = contentRoot, publicDir = path.join(root, 'public'), configFile = path.join(root, 'site.config.js'), configOverride = {} } = {}) {
  const config = await loadConfig(configFile, configOverride);
  const files = (await walk(contentDir)).filter(f => f.endsWith('.md'));
  const pages = [];
  for (const file of files) {
    const relative = path.relative(contentDir, file).split(path.sep).join('/');
    const [locale, ...parts] = relative.split('/');
    if (!Object.hasOwn(config.locales, locale)) throw new Error(`Unknown locale in ${relative}`);
    const { data, content } = matter(await readFile(file, 'utf8'));
    if (data.draft === true) continue;
    if (typeof data.title !== 'string' || !data.title.trim() || typeof data.translationKey !== 'string' || !data.translationKey.trim()) throw new Error(`${relative} needs a title and translationKey.`);
    for (const field of ['description', 'navTitle']) if (data[field] !== undefined && typeof data[field] !== 'string') throw new Error(`${relative}: ${field} must be a string.`);
    for (const field of ['draft', 'toc', 'showChildren']) if (data[field] !== undefined && typeof data[field] !== 'boolean') throw new Error(`${relative}: ${field} must be true or false.`);
    const slug = parts.join('/').replace(/\.md$/, '').replace(/(^|\/)index$/, '');
    if (slug.split('/').some(s => s && !/^[\p{L}\p{N}_-]+$/u.test(s))) throw new Error(`Use letters, digits, hyphens or underscores in content paths: ${relative}`);
    const parent = slug.includes('/') ? slug.slice(0, slug.lastIndexOf('/')) : '';
    const url = `${config.basePath}/${locale}/${slug ? `${slug}/` : ''}`;
    if (pages.some(p => p.url === url || (p.locale === locale && p.translationKey === data.translationKey))) throw new Error(`Duplicate page URL or translationKey in ${relative}`);
    let date;
    if (data.date) {
      const parsed = new Date(data.date);
      if (Number.isNaN(parsed.valueOf())) throw new Error(`Invalid date in ${relative}`);
      date = parsed.toISOString().slice(0, 10);
    }
    pages.push({ ...data, locale, slug, parent, url, file, content, date, order: Number.isFinite(data.order) ? data.order : 100, readingTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 220)) });
  }
  for (const locale of Object.keys(config.locales)) if (!pages.some(p => p.locale === locale && !p.slug)) throw new Error(`Missing content/${locale}/index.md`);
  for (const page of pages) {
    if (page.parent && !pages.some(p => p.locale === page.locale && p.slug === page.parent)) throw new Error(`Missing parent index page for ${page.file}`);
    const ui = getMessages(page.locale, config);
    const md = createMarkdown(ui);
    // Resolve Markdown file links at build time; fail on unpublished or missing pages.
    md.core.ruler.after('inline', 'content-links', state => {
      const inspect = tokens => {
        for (const token of tokens) {
          if (token.type === 'link_open') {
            const href = token.attrGet('href');
            if (/^(?![a-z]+:|\/\/)[^?#]+\.md(?:[?#]|$)/i.test(href)) {
              const [, filePart, suffix] = href.match(/^([^?#]+)(.*)$/s);
              const target = pages.find(p => p.file === path.resolve(path.dirname(page.file), decodeURIComponent(filePart)));
              if (!target) throw new Error(`Broken Markdown link "${href}" in ${page.file}`);
              token.attrSet('href', target.url + suffix);
            } else if (href.startsWith('/') && !href.startsWith('//')) token.attrSet('href', config.basePath + href);
          }
          if (token.type === 'image') {
            const src = token.attrGet('src');
            if (src.startsWith('/') && !src.startsWith('//')) token.attrSet('src', config.basePath + src);
          }
          if (token.children) inspect(token.children);
        }
      };
      inspect(state.tokens);
    });
    const env = {};
    try { page.html = md.render(page.content, env); }
    catch (error) { throw new Error(`${page.file}: ${error.message}`, { cause: error }); }
    page.headings = env.headings;
  }

  const css = await readFile(path.join(root, 'src/styles.css'), 'utf8');
  const js = await readFile(path.join(root, 'src/client.js'), 'utf8');
  const assets = { css: `${config.basePath}/assets/style.${hash(css)}.css`, js: `${config.basePath}/assets/notebook.${hash(js)}.js` };
  // Finish rendering before replacing the last good output.
  const output = `${outDir}.tmp`;
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'assets'), { recursive: true });
  await cp(publicDir, output, { recursive: true });
  await writeFile(path.join(output, 'assets', path.basename(assets.css)), css);
  await writeFile(path.join(output, 'assets', path.basename(assets.js)), js);
  for (const page of pages) {
    const dir = path.join(output, page.locale, page.slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), renderPage(page, pages, config, assets));
  }
  for (const locale of Object.keys(config.locales)) {
    const index = pages.filter(p => p.locale === locale).map(p => ({ title: p.title, description: p.description || '', url: p.url, text: p.content.replace(/^---[\s\S]*?---/, '').replace(/[#*`\[\]>_]/g, '') }));
    await writeFile(path.join(output, locale, 'search.json'), JSON.stringify(index));
    const ui = getMessages(locale, config);
    const error = { locale, slug: '404', parent: '', translationKey: '__404', url: `${config.basePath}/${locale}/404/`, title: ui.notFound, notFound: true, html: `<p>${escapeHtml(ui.notFoundText)}</p><p><a href="${config.basePath}/${locale}/">${escapeHtml(ui.returnHome)}</a></p>` };
    const html = renderPage(error, pages, config, assets);
    await writeFile(path.join(output, locale, '404.html'), html);
    if (locale === config.defaultLocale) await writeFile(path.join(output, '404.html'), html);
  }
  const defaultHome = pages.find(p => p.locale === config.defaultLocale && !p.slug);
  await writeFile(path.join(output, 'index.html'), `<!doctype html><html lang="${config.defaultLocale}" dir="${config.locales[config.defaultLocale].dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=${escapeHtml(defaultHome.url)}"><title>${escapeHtml(config.locales[config.defaultLocale].name)}</title></head><body><a href="${escapeHtml(defaultHome.url)}">${escapeHtml(config.locales[config.defaultLocale].name)}</a></body></html>`);
  if (config.url) {
    await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${escapeHtml(config.url + p.url)}</loc></url>`).join('')}</urlset>`);
    await writeFile(path.join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.url}${config.basePath}/sitemap.xml\n`);
  }
  await rm(outDir, { recursive: true, force: true });
  await rename(output, outDir);
  return { pages, config, assets, outDir };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const { pages } = await build();
  console.log(`Built ${pages.length} pages into dist/`);
}
