import { expect, type Page } from '@playwright/test';
import type { EmployeeInput } from '../utils/testData';

export class EmployeesPage {
  constructor(private readonly page: Page) {}
  async goto() { await this.page.goto('/employees'); }
  async create(employee: EmployeeInput) {
    await this.page.getByRole('button', { name: 'Add employee' }).click();
    await this.page.getByLabel('Name').fill(employee.name);
    await this.page.getByLabel('Email').fill(employee.email);
    await this.page.getByLabel('Role').selectOption(employee.role);
    await this.page.getByLabel('Department').fill(employee.department);
    await this.page.getByRole('button', { name: 'Save employee' }).click();
  }
  async expectEmployee(name: string) {
    await expect(this.page.getByRole('row', { name: new RegExp(name) })).toBeVisible();
  }
  async editEmployee(name: string, newDepartment: string) {
    const row = this.page.getByRole('row', { name: new RegExp(name) });
    await row.getByRole('button', { name: 'Edit' }).click();
    await this.page.getByLabel('Department').fill(newDepartment);
    await this.page.getByRole('button', { name: 'Save employee' }).click();
  }
  async deleteEmployee(name: string) {
    const row = this.page.getByRole('row', { name: new RegExp(name) });
    await row.getByRole('button', { name: 'Delete' }).click();
    await this.page.getByRole('button', { name: 'Confirm delete' }).click();
  }
}
