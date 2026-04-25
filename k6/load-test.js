import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be under 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function () {
  // Test Health endpoint
  const res = http.get(`${BASE_URL}/health`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'health check is ok': (r) => r.json().server === 'ok',
  });

  sleep(1);
}
