const BASE_URL = "https://api.dev.jawhar.ai";

export const ENDPOINTS = {
  SIGNUP: `${BASE_URL}/auth/signup`,
  VERIFY_SIGNUP_OTP: `${BASE_URL}/auth/verify-signup-otp`,
  LOGIN: `${BASE_URL}/auth/signin`,
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  VERIFY_FORGOT_PASSWORD_OTP: `${BASE_URL}/auth/verify-forgot-password-otp`,
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
};
