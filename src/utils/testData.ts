import { randomUUID } from 'node:crypto';

export type EmployeeInput = {
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee' | 'Viewer';
  department: string;
};

export function uniqueEmployee(overrides: Partial<EmployeeInput> = {}): EmployeeInput {
  const id = randomUUID().slice(0, 8);
  return {
    name: `Test Employee ${id}`,
    email: `qa.${id}@example.test`,
    role: 'Employee',
    department: 'Quality Engineering',
    ...overrides
  };
}
