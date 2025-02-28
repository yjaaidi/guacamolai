import { test as base } from '@playwright/test';

export interface SetupOptions {
  advocuCredentials: {
    email: string;
    password: string;
  };
}

export const test = base.extend<SetupOptions>({
  advocuCredentials: [{ email: '', password: '' }, { option: true }],
});

export const expect = test.expect;
