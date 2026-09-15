import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { build } from './build.js';

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? htmlFiles(path.join(dir, entry.name)) : entry.name.endsWith('.html') ? [path.join(dir, entry.name)] : []))).flat();
}

// Validates any owner's generated content; no starter titles, routes, or counts.
export async function validateSite({ outDir, config }) {
  const files = await htmlFiles(outDir);
  const origin = config.url || 'https://notebook.invalid';
  const errors = [];
  const documents = new Map();
  const readDocument = async file => {
    if (!documents.has(file)) documents.set(file, load(await readFile(file, 'utf8')));
    return documents.get(file);
  };
  for (const file of files) {
    const relative = path.relative(outDir, file).split(path.sep).join('/');
    const sourceUrl = new URL(`${config.basePath}/${relative.replace(/index\.html$/, '')}`, origin);
    const $ = await readDocument(file);
    const ids = new Set();
    for (const element of $('[id]').toArray()) {
      const id = $(element).attr('id');
      if (ids.has(id)) errors.push(`${relative}: duplicate id "${id}"`);
      ids.add(id);
    }
    if (!$('html').attr('lang')) errors.push(`${relative}: missing document language`);
    if (!$('title').text().trim()) errors.push(`${relative}: missing page title`);
    if (!$('meta[http-equiv="refresh"]').length && $('h1').length !== 1) errors.push(`${relative}: expected one h1`);
    for (const element of $('a[href], link[href], script[src], img[src], [data-index]').toArray()) {
      const href = $(element).attr('href') || $(element).attr('src') || $(element).attr('data-index');
      let url;
      try { url = new URL(href, sourceUrl); } catch { errors.push(`${relative}: invalid URL "${href}"`); continue; }
      if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)) continue;
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { errors.push(`${relative}: malformed URL "${href}"`); continue; }
      if (config.basePath && pathname !== config.basePath && !pathname.startsWith(`${config.basePath}/`)) {
        errors.push(`${relative}: local link escapes basePath: ${href}`); continue;
      }
      const targetPath = path.resolve(outDir, `.${pathname.slice(config.basePath.length) || '/'}`);
      if (targetPath !== outDir && !targetPath.startsWith(`${outDir}${path.sep}`)) { errors.push(`${relative}: invalid local path ${href}`); continue; }
      const info = await stat(targetPath).catch(() => null);
      const target = info?.isDirectory() ? path.join(targetPath, 'index.html') : targetPath;
      if (!info || !(await stat(target).catch(() => null))) { errors.push(`${relative}: missing target ${href}`); continue; }
      if (url.hash && target.endsWith('.html')) {
        const targetDoc = await readDocument(target);
        let id;
        try { id = decodeURIComponent(url.hash.slice(1)); } catch { errors.push(`${relative}: malformed fragment ${href}`); continue; }
        if (!targetDoc('[id]').toArray().some(el => targetDoc(el).attr('id') === id)) errors.push(`${relative}: missing fragment ${href}`);
      }
    }
    for (const element of $('img').toArray()) if ($(element).attr('alt') === undefined) errors.push(`${relative}: image needs alternative text`);
  }
  if (errors.length) throw new Error(`Site validation failed:\n${errors.map(error => `- ${error}`).join('\n')}`);
  return { htmlFiles: files.length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const output = await build();
  const checked = await validateSite(output);
  console.log(`Built ${output.pages.length} pages; checked ${checked.htmlFiles} HTML files and all local links, assets, search indexes, and anchors.`);
}
