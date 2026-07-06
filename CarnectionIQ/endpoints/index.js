export const BASE_URL = "https://api.dev.carnectioniq.com";

export const ENDPOINTS = {
    LOGIN: `${BASE_URL}/auth/login`,
    SIGNUP: `${BASE_URL}/auth/signup`,
    VERIFY_OTP: `${BASE_URL}/auth/verify-signup-otp`,
    ONBOARDING: `${BASE_URL}/dealer/onboarding`,
    SUBSCRIPTION_PLANS: `${BASE_URL}/stripe/subscriptions/plans`,
    SUBSCRIPTION_CHECKOUT: `${BASE_URL}/stripe/subscriptions/checkout`,
    STRIPE_WEBHOOK: `${BASE_URL}/webhooks/stripe`,
    ADD_VEHICLE: `${BASE_URL}/dealer/inventory/vehicle`,
};
