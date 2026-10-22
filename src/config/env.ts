export const env = {
  baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
  apiBaseURL: process.env.API_BASE_URL ?? `${process.env.BASE_URL ?? 'http://127.0.0.1:3000'}/api`,
  username: process.env.TEST_USERNAME ?? 'admin@example.com',
  password: process.env.TEST_PASSWORD ?? 'Admin123!',
  viewerUsername: process.env.VIEWER_USERNAME ?? 'viewer@example.com',
  viewerPassword: process.env.VIEWER_PASSWORD ?? 'Viewer123!'
};

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
