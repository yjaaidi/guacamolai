import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';
import { config as dotEnvConfig } from 'dotenv';
import { join } from 'path';
import type { Options } from './e2e/testing/fixtures';
import type { SetupOptions } from './e2e/testing/setup-fixtures';

const baseURL = 'https://gde.advocu.com';

dotEnvConfig({ path: join(workspaceRoot, '.env.local') });

const isCI = !!process.env.CI;

const ciOverrides = defineConfig(
  isCI
    ? {
        timeout: 60_000,
        expect: {
          timeout: 10_000,
        },
        use: {
          actionTimeout: 10_000,
        },
      }
    : {}
);

const __filename = new URL(import.meta.url).pathname;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<Options & SetupOptions>({
  ...nxE2EPreset(__filename, { testDir: './e2e' }),
  ...ciOverrides,
  timeout: 10_000,
  retries: 2,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    ...ciOverrides.use,
    baseURL,
    geminiApiKey: getEnv('GEMINI_API_KEY'),
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      use: {
        advocuCredentials: {
          email: getEnv('ADVOCU_EMAIL'),
          password: getEnv('ADVOCU_PASSWORD'),
        },
      },
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: join(workspaceRoot, 'apps/guacamolai/.auth/user.json'),
      },
      dependencies: ['setup'],
    },
  ],
});

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is missing`);
  }
  return value;
}
