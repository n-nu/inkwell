import { defineConfig, devices } from '@playwright/test';

const clientPort = process.env.PLAYWRIGHT_CLIENT_PORT || '5173';
const clientUrl = `http://localhost:${clientPort}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: clientUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: './server',
      port: 4000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run dev -- --port ${clientPort} --strictPort`,
      cwd: './client',
      url: clientUrl,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
