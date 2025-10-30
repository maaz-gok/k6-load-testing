import http from "k6/http";
import { check, sleep } from "k6";
import { options } from "../Scenarios.js";
import { generateRandomEmail } from "./SignUpLogin.js";
import login from "./login.js";
import { endpoints } from "./config/endpoints.js";

export { options };

let token;

export function setup() {
  // login once before test starts
  token = login();
  if (!token) {
    throw new Error("❌ Login failed — cannot continue test");
  }
  console.log("✅ Logged in once successfully — token stored.");
  return { token };
}

export default function (data) {
  const token = data.token;

  if (__ITER >= 1000) {
    console.log("Reached 1000 invited users — stopping further invites.");
    return;
  }

  const payload = JSON.stringify({
    fullName: `Test ${__ITER}`,
    email: generateRandomEmail(),
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const res = http.post(endpoints.INVITE_MEMBERS_URL, payload, params);

  check(res, {
    "Invite user status is 201": (r) => r.status === 201,
  });

  console.log(`Invite #${__ITER} → Status: ${res.status}`);

  sleep(0.5);
}
