import http from "k6/http";
import { check } from "k6";
import { endpoints } from "./config/endpoints.js";
import { options } from "../Scenarios.js";

export { options };

export default function login(email, password) {
  const LoginDetails = {
    email: email,
    password: password,
  };

  const loginRes = http.post(
    endpoints.LOGIN,
    JSON.stringify(LoginDetails),
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  check(loginRes, {
    "Login success": (r) => r.status === 200 || r.status === 201,
  });

  const body = loginRes.json();

  const token = body?.data?.token || body?.data?.accessToken; 

  if (!token) {
    console.error("No token returned", body);
    return null;
  }

  return token; 
}
