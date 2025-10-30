import http from 'k6/http';
import { check, sleep } from 'k6';
import { options } from '../Scenarios.js';  

export { options };  

const BASE_URL = 'https://api.dev.socialsmartai.com';
const loginUrl = `${BASE_URL}/auth/login`;
const contentPlanUrl = `${BASE_URL}/content-plan/generate-weekly-all-platforms`;
const generateStrategyUrl = `${BASE_URL}/strategy/generate`;
const regenerateStrategyUrl = `${BASE_URL}/strategy/regenerate`;

const user = {
  email: 'maaz+65@geeksofkolachi.com',
  password: 'Nmdp7788!', 
};

export default function () {
  console.log(`VU ${__VU} starting iteration`);

  // Step 1: Login
  const loginRes = http.post(loginUrl, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginBody = loginRes.json();

  const loginCheck = check(loginRes, {
    'Login status is 201': (r) => r.status === 201,
    'Login token exists': () => loginBody?.data?.token !== undefined,
  });

  if (!loginCheck) {
    console.error(`VU ${__VU} - Login failed: status ${loginRes.status}, body: ${loginRes.body}`);
    return;
  }

  const token = loginBody.data.token;
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: '180s',
  };

  // Step 2: Content Plan API
  const contentRes = http.post(contentPlanUrl, null, authHeaders);
  const contentCheck = check(contentRes, {
    'Content Plan status is 201': (r) => r.status === 201,
  });
  if (!contentCheck) {
    console.error(`VU ${__VU} - Content Plan failed: status ${contentRes.status}, body: ${contentRes.body}`);
  } else {
    console.log(`VU ${__VU} - Content Plan: ${contentRes.status}`);
  }

  sleep(0.5);

  // Step 3: Strategy Generate API
  const generateRes = http.post(generateStrategyUrl, null, authHeaders);
  const generateCheck = check(generateRes, {
    'Strategy Generate status is 201': (r) => r.status === 201,
  });
  if (!generateCheck) {
    console.error(`VU ${__VU} - Strategy Generate failed: status ${generateRes.status}, body: ${generateRes.body}`);
  } else {
    console.log(`VU ${__VU} - Strategy Generate: ${generateRes.status}`);
  }

  sleep(0.5);

  // Step 4: Strategy Regenerate API (GET)
  const regenerateRes = http.get(regenerateStrategyUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: '180s',
  });

  const regenerateCheck = check(regenerateRes, {
    'Strategy Regenerate status is 200': (r) => r.status === 200,
  });
  if (!regenerateCheck) {
    console.error(`VU ${__VU} - Strategy Regenerate failed: status ${regenerateRes.status}, body: ${regenerateRes.body}`);
  } else {
    console.log(`VU ${__VU} - Strategy Regenerate: ${regenerateRes.status}`);
  }

  sleep(0.5);

  console.log(`VU ${__VU} finished iteration`);
}