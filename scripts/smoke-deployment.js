import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { chromium, firefox, webkit } from '@playwright/test';
import { loadConfig, root } from '../src/build.js';

const origin = process.argv[2];
if (!origin || !/^https?:\/\/[^/]+\/?$/.test(origin)) throw new Error('Usage: npm run test:deployment -- https://your-host.example (origin only; basePath comes from site.config.js)');
const config = await loadConfig();
const requests = new Map();
const pages = [];
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { await inspect(file); continue; }
    if (!file.endsWith('index.html')) continue;
    const relative = path.relative(path.join(root, 'dist'), file).split(path.sep).join('/').replace(/index\.html$/, '');
    const route = `${config.basePath}/${relative}`;
    const $ = load(await readFile(file, 'utf8'));
    requests.set(route, 'text/html');
    if ($('h1').length) pages.push({ route, title: $('h1').text(), locale: $('html').attr('lang') });
    for (const element of $('script[src], link[rel="stylesheet"], link[rel="icon"], img[src], [data-index]').toArray()) {
      const url = $(element).attr('src') || $(element).attr('href') || $(element).attr('data-index');
      if (!url.startsWith('/') || url.startsWith('//')) continue;
      requests.set(url, url.endsWith('.css') ? 'text/css' : url.endsWith('.js') ? 'javascript' : url.endsWith('.json') ? 'application/json' : 'image/');
    }
  }
}
await inspect(path.join(root, 'dist'));
for (const [route, mime] of requests) {
  const response = await fetch(new URL(route, origin), { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `HTTP ${response.status}: ${route}`);
  assert.ok(response.headers.get('content-type')?.includes(mime), `Wrong MIME type: ${route}`);
  assert.ok((await response.arrayBuffer()).byteLength > 0, `Empty response: ${route}`);
}
for (const locale of Object.keys(config.locales)) {
  const response = await fetch(new URL(`${config.basePath}/${locale}/missing-release-check/`, origin));
  assert.equal(response.status, 404, `Missing route in ${locale} must return HTTP 404`);
  const $ = load(await response.text());
  assert.equal($('html').attr('lang'), locale, `Localized 404 for ${locale}`);
}
console.log(`HTTP smoke passed: ${pages.length} content pages, ${requests.size} page/asset/index URLs, localized 404s.`);

await mkdir(path.join(root, '.impeccable/review/release'), { recursive: true });
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const locale of Object.keys(config.locales)) {
      const home = pages.find(p => p.route === `${config.basePath}/${locale}/`);
      await page.goto(new URL(home.route, origin).href);
      await page.locator('h1').waitFor();
      assert.equal(await page.locator('h1').textContent(), home.title);
      await page.locator('#theme').selectOption('dark');
      await page.reload();
      assert.equal(await page.locator('#theme').inputValue(), 'dark');
      await page.locator('#search-input').fill(home.title);
      await page.locator('#search-results a').first().waitFor();
      assert.equal(await page.locator('#search-results a').first().getAttribute('href'), home.route);
      await page.locator('#search-input').fill('');
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('.page-navigation > summary').click();
      assert.ok(await page.locator('.page-tree').isVisible());
      await page.locator('.page-navigation > summary').click();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(root, `.impeccable/review/release/live-${name}-${locale}.png`), fullPage: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    assert.deepEqual(errors, []);
    const context = await browser.newContext({ javaScriptEnabled: false });
    const plain = await context.newPage();
    await plain.goto(new URL(`${config.basePath}/${config.defaultLocale}/`, origin).href);
    assert.ok(await plain.locator('h1').isVisible());
    assert.ok(await plain.locator('.search').isHidden());
    await context.close();
    console.log(`${name}: live themes, search, mobile navigation, languages, and no-JavaScript smoke passed.`);
  } finally { await browser.close(); }
}
