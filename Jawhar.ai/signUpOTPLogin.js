import http from "k6/http";
import { check, sleep } from "k6";
import { options } from "../Scenarios.js";
import { generateRandomEmail } from "../utils/RandomEmail.js";
import { ENDPOINTS } from "./config/endpoints.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js"; 

export { options };

const otp = "123456";

export default function signup() {
  const userDetails = {
    displayName: "Maaz Imtiaz",
    email: generateRandomEmail(),
    password: "Test123!",
  };

  // Signup
  const signupRes = http.post(ENDPOINTS.SIGNUP, JSON.stringify(userDetails), {
    headers: { "Content-Type": "application/json" },
  });
  check(signupRes, { "Signup status is 201": (r) => r.status === 201 });
  sleep(1.5);

  // Verify OTP
  const otpRes = http.post(
    ENDPOINTS.VERIFY_SIGNUP_OTP,
    JSON.stringify({ email: userDetails.email, otp }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(otpRes, { "OTP Verification status is 201": (r) => r.status === 201 });
  sleep(1.5);

  // Login
  const loginRes = http.post(
    ENDPOINTS.LOGIN,
    JSON.stringify({
      email: userDetails.email,
      password: userDetails.password,
      rememberMe: false,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(loginRes, { "Login status is 201": (r) => r.status === 201 });
  sleep(1.5);

  // Forgot Password
  const forgotRes = http.post(
    ENDPOINTS.FORGOT_PASSWORD,
    JSON.stringify({ email: userDetails.email }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(forgotRes, { "Forgot Password status is 201": (r) => r.status === 201 });
  sleep(1.5);

  // Verify Forgot Password OTP
  const forgotOtpRes = http.post(
    ENDPOINTS.VERIFY_FORGOT_PASSWORD_OTP,
    JSON.stringify({ email: userDetails.email, otp }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(forgotOtpRes, {
    "Forgot Password OTP status is 201": (r) => r.status === 201,
  });
  sleep(1.5);

  // Reset Password
  const resetRes = http.post(
    ENDPOINTS.RESET_PASSWORD,
    JSON.stringify({ email: userDetails.email, password: "NewPass123!" }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(resetRes, { "Reset Password status is 201": (r) => r.status === 201 });
  sleep(1);
}
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}