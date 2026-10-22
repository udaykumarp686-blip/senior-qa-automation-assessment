import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/utils/apiClient';
import { uniqueEmployee } from '../../src/utils/testData';

test('@api @regression employee lifecycle is persisted through the API', async ({ request }) => {
  const api = new ApiClient(request);
  const token = await api.login();
  const employee = uniqueEmployee();

  const created = await api.createEmployee(token, employee);
  expect(created.status()).toBe(201);
  const createdBody = await created.json() as { id: string; name: string };
  expect(createdBody.name).toBe(employee.name);

  const read = await api.getEmployee(token, createdBody.id);
  expect(read.ok()).toBeTruthy();
  expect(await read.json()).toMatchObject({ email: employee.email, role: employee.role });

  const updated = await api.updateEmployee(token, createdBody.id, { department: 'Automation Platform' });
  expect(updated.ok()).toBeTruthy();
  expect(await updated.json()).toMatchObject({ department: 'Automation Platform' });

  const deleted = await api.deleteEmployee(token, createdBody.id);
  expect([200, 204]).toContain(deleted.status());

  const missing = await api.getEmployee(token, createdBody.id);
  expect(missing.status()).toBe(404);
});

test('@api @regression unauthenticated users cannot list employees', async ({ request }) => {
  const response = await request.get(`${process.env.API_BASE_URL ?? 'http://127.0.0.1:3000/api'}/employees`);
  expect(response.status()).toBe(401);
});

test('@api @regression viewer cannot create employees', async ({ request }) => {
  const api = new ApiClient(request);
  const token = await api.login(process.env.VIEWER_USERNAME, process.env.VIEWER_PASSWORD);
  const response = await api.createEmployee(token, uniqueEmployee());

  expect(response.status()).toBe(403);
});
