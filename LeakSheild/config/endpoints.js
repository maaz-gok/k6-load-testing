const BASE_URL = "https://api.aliengate.jp";

export const endpoints = {
    LOGIN : `${BASE_URL}/auth/login`,
    BREACH_CHECK_BULK : `${BASE_URL}/breach/check-bulk`,
    BREACH_CHECK_SINGLE : `${BASE_URL}/breach/check`,
    EMAIL_SCAN : `${BASE_URL}/email-accounts/scan`,

};
