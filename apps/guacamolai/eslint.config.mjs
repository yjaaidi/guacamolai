import playwright from 'eslint-plugin-playwright';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {},
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.ts'],
  },
].map((config) => ({
  ...config,
  ignores: [...(config.ignores || []), 'test-output'],
}));
