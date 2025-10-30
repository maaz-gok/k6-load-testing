import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { endpoints } from "./config/endpoints.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";


export { options };

const userCredentials = {
  email: "maaz+templates@geeksofkolachi.com",
  password: "Test123!",
};

export default function login() {
  const res = http.post(endpoints.LOGIN, JSON.stringify(userCredentials), {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "Login request successful": (r) => r.status === 201,
  });

  console.log(`Login Response Status: ${res.status}`);

  let token = null;
  try {
    const body = JSON.parse(res.body);
    token = body?.data?.token || null;
  } catch (err) {
    console.error("Error parsing login response:", err);
  }

  if (!token) {
    console.error("❌ No token found in login response:", res.body);
  } else {
    console.log("✅ Login successful — token received");
  }

  return token;
}
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}
