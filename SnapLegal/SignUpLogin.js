import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { generateRandomEmail } from "../utils/RandomEmail.js";
import { endpoints } from "./config/endpoints.js";

export { options };

export default function login() {
  const userDetails = {
    fullName: "Maaz Imtiaz",
    email: generateRandomEmail(),
    password: "Nmdp7788!",
  };

  const signupRes = http.post(endpoints.SIGNUP, JSON.stringify(userDetails), {
    headers: { "Content-Type": "application/json" },
  });

  check(signupRes, {
    "Signup status is 201": (r) => r.status === 201,
  });

  console.log(`Signup Response Status: ${signupRes.status}`);

  //login after signup
  const loginRes = http.post(endpoints.LOGIN, JSON.stringify(userDetails), {
    headers: { "Content-Type": "application/json" },
  });

  check(loginRes, {
    "Login status is 201": (r) => r.status === 201,
  });
  console.log(`Login Response Status: ${loginRes.status}`);

  let token = null;
  try {
    const body = JSON.parse(loginRes.body);
    token = body.data?.token || null;
  } catch (err) {
    console.error("Error parsing login response:", err);
  }

  if (!token) {
    console.error("No token found in login response:", loginRes.body);
  }

  return token;
}
