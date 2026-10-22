import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}
  async goto() { await this.page.goto('/login'); }
  async login(username: string, password: string) {
    await this.page.getByLabel('Email').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
  async expectError(message: string) {
    await expect(this.page.getByRole('alert')).toContainText(message);
  }
}
