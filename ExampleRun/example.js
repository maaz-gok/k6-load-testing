import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    rate: {
      executor: 'constant-arrival-rate',
      rate: 1,              // 1 iteration every 10 seconds
      timeUnit: '10s',      // time unit for rate
      duration: '10s',       // total test duration
      preAllocatedVUs: 5,   // initial VUs to allocate
      maxVUs: 20,           // max possible VUs if needed
    },
  },
};

export default function () {
  const res = http.get('https://test.k6.io');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
