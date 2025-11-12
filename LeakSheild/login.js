import http from "k6/http";
import { check } from "k6";

const BASE_URL = "https://api.aliengate.jp";
const LoginURL = `${BASE_URL}/auth/login`;

export default function login() {
  const LoginDetails = {
    email: "maaz+3@geeksofkolachi.com",
    password: "Test123!",
  };

  const loginRes = http.post(LoginURL, JSON.stringify(LoginDetails), {
    headers: { "Content-Type": "application/json" },
  });

  console.log(`Login Response Status: ${loginRes.status}`);

  check(loginRes, {
    "Login status is 201": (r) => r.status === 201,
  });

  const body = loginRes.json();
  const token = body?.data?.accessToken || body?.accessToken;

  if (!token) {
    console.error("No access token returned from login!");
  } else {
    //console.log(`Access Token: ${token}`);
  }

  return token;
}
