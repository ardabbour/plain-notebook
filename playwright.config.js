import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  projects: ['chromium', 'firefox', 'webkit'].map(name => ({ name, use: { browserName: name } })),
  reporter: 'list',
  use: { baseURL: 'http://localhost:4322', viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: 'node tests/serve-fixture.js',
    url: 'http://localhost:4322/en/',
    env: { PORT: '4322' },
    reuseExistingServer: false,
  },
});
