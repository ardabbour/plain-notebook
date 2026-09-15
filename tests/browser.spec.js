import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('nested navigation, breadcrumbs, translations and mobile disclosure work', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('.nav-group > summary').filter({ hasText: 'Notebook' }).click();
  await page.locator('.page-tree').getByRole('link', { name: 'Writing guide' }).click();
  await expect(page).toHaveURL(/\/en\/notebook\/markdown\//);
  await expect(page.locator('.breadcrumbs')).toContainText('Notebook');
  await page.locator('.language-picker summary').click();
  await page.locator('.language-picker').getByRole('link', { name: 'العربية', exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/notebook\/markdown\//);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.page-navigation')).not.toHaveAttribute('open');
  await page.locator('.page-navigation > summary').click();
  await expect(page.locator('.page-tree')).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.page-tree')).toBeVisible();
});

test('theme selection persists and system follows live preference changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.getByLabel('Appearance').selectOption('light');
  await page.reload();
  await expect(page.getByLabel('Appearance')).toHaveValue('light');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
  await page.getByLabel('Appearance').selectOption('system');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light');
});

test('search loads on demand, ranks titles, supports keyboard dismissal and handles no results', async ({ page }) => {
  const requests = [];
  page.on('request', request => { if (request.url().endsWith('/search.json')) requests.push(request.url()); });
  await page.goto('/en/');
  expect(requests).toHaveLength(0);
  await page.keyboard.press('/');
  const input = page.getByRole('searchbox');
  await expect(input).toBeFocused();
  await input.fill('writing guide');
  await expect(page.locator('#search-results a').first()).toContainText('The writing guide');
  expect(requests).toHaveLength(1);
  await input.press('ArrowDown');
  await expect(page.locator('#search-results a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.search-panel')).toBeHidden();
  await input.fill('unfindablexyz');
  await expect(page.getByRole('status')).toContainText('No pages found');
  await input.fill('');
  await expect(page.locator('.search-panel')).toBeHidden();
});

test('search reports loading/failure and retries; blocked storage leaves controls functional', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } }); });
  let release;
  await page.route('**/en/search.json', async route => {
    await new Promise(resolve => { release = resolve; });
    await route.abort();
  });
  await page.goto('/en/');
  await page.getByLabel('Appearance').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('searchbox').fill('notebook');
  await expect(page.getByRole('status')).toContainText('Searching…');
  await expect.poll(() => Boolean(release)).toBeTruthy();
  release();
  await expect(page.getByRole('status')).toContainText('Search could not load');
  await page.unroute('**/en/search.json');
  await page.getByRole('searchbox').fill('writing');
  await expect(page.locator('#search-results a').first()).toContainText('The writing guide');
});

test('without JavaScript, reading, mobile navigation, language links and details still work', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('http://localhost:4322/en/notebook/markdown/');
  await expect(page.getByRole('heading', { name: 'The writing guide', exact: true })).toBeVisible();
  await expect(page.locator('.search')).toBeHidden();
  await expect(page.locator('.theme-picker')).toBeHidden();
  await expect(page.locator('.page-tree')).toBeVisible();
  await page.locator('.page-navigation > summary').click();
  await expect(page.locator('.page-tree')).toBeHidden();
  await page.locator('.prose-details summary').click();
  await expect(page.locator('.prose-details')).toHaveAttribute('open');
  await page.locator('.language-picker summary').click();
  await page.locator('.language-picker').getByRole('link', { name: 'العربية', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await context.close();
});

test('no document overflow, accessible markup, and valid layouts in both directions and themes', async ({ page }, testInfo) => {
  for (const entry of [
    { route: '/en/', width: 1440, height: 1000, scheme: 'light', shot: 'desktop' },
    { route: '/en/', width: 390, height: 844, scheme: 'light', shot: 'mobile' },
    { route: '/ar/notebook/markdown/', width: 1440, height: 1000, scheme: 'dark', shot: 'arabic-desktop-dark' },
    { route: '/ar/notebook/markdown/', width: 390, height: 844, scheme: 'dark', shot: 'arabic-mobile-dark' },
  ]) {
    await page.setViewportSize({ width: entry.width, height: entry.height });
    await page.emulateMedia({ colorScheme: entry.scheme });
    await page.goto(entry.route);
    await expect(page.locator('h1')).toBeVisible();
    if (entry.route.startsWith('/ar/')) {
      for (const code of await page.locator('.prose :not(pre) > code').all()) {
        await expect(code).toHaveCSS('direction', 'ltr');
        await expect(code).toHaveCSS('unicode-bidi', 'isolate');
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({ path: `.impeccable/review/release/${testInfo.project.name}-${entry.shot}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 320, height: 700 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('missing translations are explicit and unknown routes return localized 404 responses', async ({ page }) => {
  await page.goto('/en/notebook/small-web/');
  await page.locator('.language-picker summary').click();
  await expect(page.locator('[aria-disabled="true"]').filter({ hasText: 'العربية' })).toContainText('Translation unavailable');
  await expect(page.locator('.language-fallback[href="/ar/"]')).toBeVisible();
  const response = await page.goto('/ar/missing-page/');
  expect(response.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('link', { name: 'العودة إلى الرئيسية', exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/$/);
});

test('a third language works and deep long pages stay readable on a small screen', async ({ page }) => {
  await page.goto('/fr/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByLabel('Apparence')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Rechercher' }).fill('writing');
  await expect(page.locator('#search-results a').first()).toHaveAttribute('href', '/fr/notebook/markdown/');
  await page.goto('/en/notebook/research/books/essays/long-note/');
  await expect(page.locator('.breadcrumbs a')).toHaveCount(5);
  await expect(page.locator('.outline a')).toHaveCount(30);
  await page.setViewportSize({ width: 320, height: 700 });
  await page.locator('.page-navigation > summary').click();
  await expect(page.locator('.page-tree [aria-current="page"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.page-navigation > summary').click();
  await page.locator('.page-footer a').click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});
