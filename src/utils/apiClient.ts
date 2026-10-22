import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(username = env.username, password = env.password): Promise<string> {
    const response = await this.request.post(`${env.apiBaseURL}/auth/login`, {
      data: { username, password }
    });
    if (!response.ok()) throw new Error(`Login failed: ${response.status()} ${await response.text()}`);
    const body = await response.json() as { token: string };
    return body.token;
  }

  async getEmployees(token: string): Promise<APIResponse> {
    return this.request.get(`${env.apiBaseURL}/employees`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async createEmployee(token: string, employee: object): Promise<APIResponse> {
    return this.request.post(`${env.apiBaseURL}/employees`, {
      headers: { Authorization: `Bearer ${token}` }, data: employee
    });
  }

  async getEmployee(token: string, id: string): Promise<APIResponse> {
    return this.request.get(`${env.apiBaseURL}/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  async updateEmployee(token: string, id: string, patch: object): Promise<APIResponse> {
    return this.request.patch(`${env.apiBaseURL}/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` }, data: patch
    });
  }

  async deleteEmployee(token: string, id: string): Promise<APIResponse> {
    return this.request.delete(`${env.apiBaseURL}/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
