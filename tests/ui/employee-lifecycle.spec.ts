import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { EmployeesPage } from '../../src/pages/EmployeesPage';
import { env } from '../../src/config/env';
import { uniqueEmployee } from '../../src/utils/testData';

test('@smoke @regression admin can create, update, verify and delete an employee', async ({ page, request }) => {
  const employee = uniqueEmployee();
  const login = new LoginPage(page);
  const employees = new EmployeesPage(page);

  await login.goto();
  await login.login(env.username, env.password);
  await expect(page).toHaveURL(/\/employees$/);
  await employees.goto();
  await employees.create(employee);
  await employees.expectEmployee(employee.name);

  // Independent API-level verification of the UI-created record.
  const loginResponse = await request.post(`${env.apiBaseURL}/auth/login`, {
    data: { username: env.username, password: env.password }
  });
  expect(loginResponse.ok()).toBeTruthy();
  const { token } = await loginResponse.json() as { token: string };
  const listResponse = await request.get(`${env.apiBaseURL}/employees`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  expect(listResponse.ok()).toBeTruthy();
  const records = await listResponse.json() as Array<{ name: string; email: string }>;
  expect(records.some(e => e.name === employee.name && e.email === employee.email)).toBeTruthy();

  const updatedDepartment = 'Platform Quality';
  await employees.editEmployee(employee.name, updatedDepartment);
  await expect(page.getByRole('row', { name: new RegExp(employee.name) })).toContainText(updatedDepartment);

  await employees.deleteEmployee(employee.name);
  await expect(page.getByRole('row', { name: new RegExp(employee.name) })).toHaveCount(0);
});

test('@regression viewer is denied employee creation', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login(env.viewerUsername, env.viewerPassword);
  await expect(page).toHaveURL(/\/employees$/);
  await expect(page.getByRole('button', { name: 'Add employee' })).toHaveCount(0);
  await expect(page.getByText('Read-only access')).toBeVisible();
});
