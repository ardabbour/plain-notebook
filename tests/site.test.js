import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { load } from 'cheerio';
import { build } from '../src/build.js';
import { createMarkdown } from '../src/markdown.js';
import { messages } from '../src/i18n.js';
import { createFixture, writePage } from './fixtures.js';
import { validateSite } from '../src/check.js';
import { startServer } from '../src/server.js';

const temp = await mkdtemp(path.join(tmpdir(), 'plain-notebook-test-'));
const fixture = await createFixture(path.join(temp, 'standard'));
const output = await build(fixture);
const htmlFor = p => readFile(path.join(output.outDir, p.locale, p.slug, 'index.html'), 'utf8');
test.after(async () => rm(temp, { recursive: true, force: true }));

test('all built pages have correct language, reading direction, unique IDs, one title and active navigation', async () => {
  assert.ok(output.pages.length > 0);
  for (const page of output.pages) {
    const $ = load(await htmlFor(page));
    assert.equal($('html').attr('lang'), page.locale);
    assert.equal($('html').attr('dir'), output.config.locales[page.locale].dir);
    assert.equal($('h1').length, 1);
    assert.equal($('.page-tree [aria-current="page"]').attr('href'), page.url);
    const ids = $('[id]').map((_, el) => $(el).attr('id')).get();
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${page.url}`);
    assert.ok($('.theme-picker').is('[hidden]'));
    assert.ok($('.search').is('[hidden]'));
  }
});

test('every internal link, stylesheet, script, image, and fragment resolves', async () => {
  for (const page of output.pages) {
    const $ = load(await htmlFor(page));
    for (const element of $('a[href], link[href], script[src], img[src]').toArray()) {
      const href = $(element).attr('href') || $(element).attr('src');
      const url = new URL(href, `https://notebook.test${page.url}`);
      if (url.origin !== 'https://notebook.test') continue;
      const localPath = path.join(output.outDir, decodeURIComponent(url.pathname));
      const info = await stat(localPath).catch(() => null);
      assert.ok(info, `${page.url}: missing ${href}`);
      const target = info.isDirectory() ? path.join(localPath, 'index.html') : localPath;
      await stat(target);
      if (url.hash) {
        const targetDoc = load(await readFile(target, 'utf8'));
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(targetDoc('[id]').toArray().some(el => targetDoc(el).attr('id') === id), `${page.url}: missing fragment ${href}`);
      }
    }
  }
});

test('translations retain page identity and unavailable translations have explicit home fallback', async () => {
  const about = output.pages.find(p => p.locale === 'en' && p.translationKey === 'about');
  const $ = load(await htmlFor(about));
  assert.equal($('.language-picker a[hreflang="ar"]').attr('href'), '/ar/about/');
  const essay = output.pages.find(p => p.translationKey === 'small-web');
  const missing = load(await htmlFor(essay));
  assert.match(missing('.language-picker [aria-disabled]').text(), /Translation unavailable/);
  assert.equal(missing('.language-fallback').attr('href'), '/ar/');
});

test('enriched Markdown renders without runtime dependencies', async () => {
  const guide = output.pages.find(p => p.locale === 'ar' && p.translationKey === 'markdown');
  const $ = load(await htmlFor(guide));
  assert.equal($('table').length, 1);
  assert.equal($('.task-item input').length, 3);
  assert.equal($('.task-item input[checked]').length, 2);
  assert.equal($('.task-item input[disabled]').length, 3);
  assert.ok($('.prose-details summary').length);
  assert.ok($('.callout').length);
  assert.ok($('.footnotes').length);
  assert.ok($('.hljs-keyword').length);
  assert.equal($('pre:not([dir="ltr"])').length, 0);
});

test('Markdown escapes raw HTML, blocks script links, and gives repeated headings unique IDs', () => {
  const md = createMarkdown(messages.en);
  const env = {};
  const $ = load(md.render('<script>alert(1)</script>\n\n[x](javascript:alert(1))\n\n## Same\n\n## Same\n\n## عنوان\n', env));
  assert.equal($('script').length, 0);
  assert.equal($('a[href^="javascript:"]').length, 0);
  assert.deepEqual(env.headings.map(h => h.id), ['same', 'same-2', 'عنوان']);
});

test('search indexes are local to each language and only contain published pages', async () => {
  for (const locale of Object.keys(output.config.locales)) {
    const index = JSON.parse(await readFile(path.join(output.outDir, locale, 'search.json')));
    assert.equal(index.length, output.pages.filter(p => p.locale === locale).length);
    assert.ok(index.every(p => p.url.startsWith(`/${locale}/`) && p.title && p.text));
  }
});

test('subdirectory deployment prefixes assets, navigation, translations and canonical URLs', async () => {
  const prefixed = await build({ ...fixture, outDir: path.join(temp, 'prefixed'), configOverride: { basePath: '/notes', url: 'https://example.com' } });
  const $ = load(await readFile(path.join(prefixed.outDir, 'en/notebook/markdown/index.html'), 'utf8'));
  for (const el of $('a[href^="/"], link[href^="/"], script[src^="/"]').toArray()) {
    assert.ok(($(el).attr('href') || $(el).attr('src')).startsWith('/notes/'));
  }
  assert.equal($('link[rel="canonical"]').attr('href'), 'https://example.com/notes/en/notebook/markdown/');
  assert.equal($('.search').attr('data-index'), '/notes/en/search.json');
  assert.match(await readFile(path.join(prefixed.outDir, 'sitemap.xml'), 'utf8'), /https:\/\/example.com\/notes\/ar\//);
});

test('invalid configuration fails with actionable errors', async () => {
  await assert.rejects(build({ ...fixture, outDir: path.join(temp, 'bad'), configOverride: { basePath: '../bad' } }), /basePath must/);
  await assert.rejects(build({ ...fixture, outDir: path.join(temp, 'bad'), configOverride: { defaultLocale: 'missing' } }), /defaultLocale must/);
});

test('real owner content passes generic release checks without depending on starter pages', async () => {
  const actual = await build({ outDir: path.join(temp, 'owner-site') });
  assert.ok((await validateSite(actual)).htmlFiles > 0);
});

test('a replacement site can use a third language as default with translated interface labels', async () => {
  const custom = await createFixture(path.join(temp, 'custom'));
  const configured = await build({ ...custom, configOverride: { defaultLocale: 'fr', basePath: '/carnet', url: 'https://owner.example' } });
  await validateSite(configured);
  const $ = load(await readFile(path.join(custom.outDir, 'fr/index.html'), 'utf8'));
  assert.equal($('html').attr('lang'), 'fr');
  assert.equal($('.identity').text(), 'Le carnet');
  assert.equal($('.breadcrumbs').text(), 'Accueil');
  assert.equal($('#theme').attr('aria-label'), 'Apparence');
  assert.equal($('.search label').text(), 'Rechercher');
  assert.match(await readFile(path.join(custom.outDir, 'index.html'), 'utf8'), /url=\/carnet\/fr\//);
});

test('large notebooks, deep ancestry, long pages, draft exclusion, and query/fragment links survive', async () => {
  const large = await createFixture(path.join(temp, 'large'), { count: 180 });
  const result = await build(large);
  assert.ok(result.pages.length > 180);
  await validateSite(result);
  assert.ok(result.pages.every(p => p.translationKey !== 'draft'));
  assert.equal(await stat(path.join(result.outDir, 'en/draft')).catch(() => null), null);
  const index = JSON.parse(await readFile(path.join(result.outDir, 'en/search.json')));
  assert.ok(index.every(p => !p.text.includes('Never publish this draft')));
  const $ = load(await readFile(path.join(result.outDir, 'en/notebook/research/books/essays/long-note/index.html'), 'utf8'));
  assert.equal($('.breadcrumbs a').length, 5);
  assert.equal($('.nav-group[open]').length, 4);
  assert.equal($('.outline a').length, 30);
  const guide = load(await readFile(path.join(result.outDir, 'en/notebook/markdown/index.html'), 'utf8'));
  assert.equal(guide('.prose a').first().attr('href'), '/en/about/?from=guide#bio');
  assert.equal(guide('#content').length, 1);
  assert.equal(guide('h2#content-2').length, 1);
  assert.equal(guide('h2#fn1-2').length, 1);
});

test('failed authoring builds preserve output and report missing pages, parents, duplicates and dates', async () => {
  const custom = await createFixture(path.join(temp, 'errors'));
  await build(custom);
  const original = await readFile(path.join(custom.outDir, 'en/index.html'), 'utf8');
  const broken = await writePage(custom.contentDir, 'en/broken.md', { title: 'Broken', translationKey: 'broken' }, '[Draft](./draft.md)');
  await assert.rejects(build(custom), /Broken Markdown link.*draft.md/);
  assert.equal(await readFile(path.join(custom.outDir, 'en/index.html'), 'utf8'), original);
  await rm(broken);
  const orphan = await writePage(custom.contentDir, 'en/missing/child.md', { title: 'Child', translationKey: 'child' });
  await assert.rejects(build(custom), /Missing parent index/);
  await rm(path.dirname(orphan), { recursive: true });
  const duplicate = await writePage(custom.contentDir, 'en/duplicate.md', { title: 'Duplicate', translationKey: 'home' });
  await assert.rejects(build(custom), /Duplicate page URL or translationKey/);
  await rm(duplicate);
  const dated = await writePage(custom.contentDir, 'en/dated.md', { title: 'Dated', translationKey: 'dated', date: 'not-a-date' });
  await assert.rejects(build(custom), /Invalid date/);
  await rm(dated);
});

test('release validator catches missing image files and heading anchors', async () => {
  const custom = await createFixture(path.join(temp, 'links'));
  await writePage(custom.contentDir, 'en/links.md', { title: 'Links', translationKey: 'links' }, '[Missing anchor](./about.md#absent)\n\n![A missing image](/images/absent.png)');
  const result = await build(custom);
  await assert.rejects(validateSite(result), error => /missing fragment/.test(error.message) && /missing target/.test(error.message));
});

test('preview preserves query strings and handles HEAD, malformed paths, and missing locales', async () => {
  const server = await startServer({ preview: true, port: 0, watchFiles: false, buildOptions: fixture });
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const redirect = await fetch(`${origin}/en/about?from=guide`, { redirect: 'manual' });
    assert.equal(redirect.status, 308);
    assert.equal(redirect.headers.get('location'), '/en/about/?from=guide');
    const head = await fetch(`${origin}/en/`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal((await fetch(`${origin}/en/`, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${origin}/%GG`)).status, 400);
    assert.equal((await fetch(`${origin}/__proto__/missing`)).status, 404);
    assert.equal((await fetch(`${origin}/%2e%2e%2fpackage.json`)).status, 403);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
