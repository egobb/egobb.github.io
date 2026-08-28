import { defineConfig } from '@playwright/test';

const visualBrowser = (process.env.VISUAL_BROWSER || 'chromium') as 'chromium' | 'firefox';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  snapshotPathTemplate: '{testDir}/__snapshots__/{arg}{ext}',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:1313',
    browserName: visualBrowser,
    colorScheme: 'dark',
    locale: 'en-US',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: {
    command: 'python3 -m http.server 1313 --directory public',
    url: 'http://127.0.0.1:1313',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
});
