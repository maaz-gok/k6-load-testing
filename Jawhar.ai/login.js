import http from "k6/http";
import { check, sleep } from "k6";
import { options } from "../Scenarios.js";
export { options };

const BASE_URL = "https://api.dev.jawhar.ai";
const LOGIN = `${BASE_URL}/auth/signin`;

const userCredentials = {
  email: "maaz+90@geeksofkolachi.com",
  password: "Nmdp7788!",
  rememberMe: true,
};

export default function login() {
  const loginRes = http.post(LOGIN, JSON.stringify(userCredentials), {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, {
    "Login status is 201": (r) => r.status === 201,
  });
  console.log(`Login Response Status: ${loginRes.status}`);

  sleep(1);
}
