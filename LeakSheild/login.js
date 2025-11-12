import http from "k6/http";
import { check } from "k6";
import { endpoints } from "./config/endpoints.js";



export default function login() {
  const LoginDetails = {
    email: "maaz+3@geeksofkolachi.com",
    password: "Test123!",
  };

  const loginRes = http.post(endpoints.LOGIN, JSON.stringify(LoginDetails), {
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
