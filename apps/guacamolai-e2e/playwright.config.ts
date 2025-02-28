import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';
import { Options } from './src/fixtures';
import { config as dotEnvConfig } from 'dotenv';
import { join } from 'path';

const baseURL = `http://localhost:5173`;

dotEnvConfig({ path: join(workspaceRoot, '.env.local') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<Options>({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  timeout: 10_000,
  retries: 2,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    geminiApiKey: process.env.GEMINI_API_KEY,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: `bun vite apps/guacamolai-e2e/fake-advocu`,
    url: baseURL,
    cwd: workspaceRoot,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
