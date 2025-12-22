import http from 'k6/http';
import { check } from 'k6';
import { endpoints } from './config/endpoints.js';
import { parentCreds, sitterCreds } from './config/creds.js';

// Helper to safely parse JSON responses
function safeJson(body) {
  try {
    return JSON.parse(body);
  } catch (e) {
    return {};
  }
}

/**
 * Logs in a user based on their role.
 * @param {string} role - Either 'parent' or 'sitter'
 * @returns {string|null} token
 */
export function login(role) {
  let email, password;

  // 1. Select Credentials based on Role
  if (role === 'parent') {
    email = parentCreds.email;
    password = parentCreds.password;
  } else if (role === 'sitter') {
    email = sitterCreds.email;
    password = sitterCreds.password;
  } else {
    console.error(`❌ Invalid role: ${role}. Use 'parent' or 'sitter'.`);
    return null;
  }

  // 2. Prepare Payload
  const payload = JSON.stringify({
    email: email,
    password: password,
  });

  // 3. Send Request
  const res = http.post(endpoints.LOGIN, payload, {
    headers: { "Content-Type": "application/json" },
  });

  // 4. Validation
  const success = check(res, {
    [`${role} Login successful`]: (r) => r.status === 200 || r.status === 201,
  });

  if (!success) {
    console.error(`❌ Login Failed for ${role} (${email}). Status: ${res.status}`);
    return null;
  }

  // 5. Extract Token
  const body = safeJson(res.body);
  const token = body.data?.token;

  if (token) {
    return token;
  } else {
    console.error(`❌ Token missing for ${role}`);
    return null;
  }
}