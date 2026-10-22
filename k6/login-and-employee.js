import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.API_BASE_URL || 'http://127.0.0.1:3000/api';
const USER = __ENV.TEST_USERNAME || 'admin@example.com';
const PASS = __ENV.TEST_PASSWORD || 'Admin123!';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    checks: ['rate>0.99']
  }
};

export default function () {
  const login = http.post(`${BASE}/auth/login`, JSON.stringify({ username: USER, password: PASS }), {
    headers: { 'Content-Type': 'application/json' }
  });
  check(login, { 'login returns 200': r => r.status === 200 });
  if (login.status === 200) {
    const token = login.json('token');
    const employee = {
      name: `k6 employee ${__VU}-${__ITER}`,
      email: `k6.${__VU}.${__ITER}.${Date.now()}@example.test`,
      role: 'Employee',
      department: 'Performance'
    };
    const create = http.post(`${BASE}/employees`, JSON.stringify(employee), {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    });
    check(create, { 'employee creation returns 201': r => r.status === 201 });
    if (create.status === 201) {
      const id = create.json('id');
      http.del(`${BASE}/employees/${id}`, null, { headers: { Authorization: `Bearer ${token}` } });
    }
  }
  sleep(1);
}
