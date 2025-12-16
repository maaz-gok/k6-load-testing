const BASE_URL = "https://baby-sitter-backend.onrender.com";

export const endpoints = {
  SIGNUP: `${BASE_URL}/auth/signup`,
  LOGIN: `${BASE_URL}/auth/login`,

  CREATE_REQUEST: `${BASE_URL}/requests`,
  GET_REQUESTS: `${BASE_URL}/requests`,

  GET_BY_ID: (requestId) => `${BASE_URL}/requests/${requestId}`,

  UPDATE_STATUS: (requestId) => `${BASE_URL}/requests/${requestId}/status`,

  MARK_AVAILABLE: (requestId) =>
    `${BASE_URL}/requests/${requestId}/mark-available`,

  ASSIGN_SITTER: (requestId, sitterId) =>
    `${BASE_URL}/requests/${requestId}/assign/${sitterId}`,
};
