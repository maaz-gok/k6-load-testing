const BASE_URL = "https://api.snaplegal.ai";

export const endpoints = {
  BASE_URL,
  GET_QUESTIONS: (templateId) =>
    `${BASE_URL}/templates/${templateId}/questions`,
  SUBMIT_RESPONSES: `${BASE_URL}/templates/responses`,
  GENERATE_DOC: `${BASE_URL}/templates/generate-document`,
  CALL_BACK: `${BASE_URL}/auth/google/callback`,
  INQUIRIES: `${BASE_URL}/inquiries`,
  INVITE_MEMBERS_URL: `${BASE_URL}/teams/invite-user`,
  LOGIN: `${BASE_URL}/auth/signin`,
  GET_PLANS: `${BASE_URL}/subscription/plans`,
  SELECT_PLAN: `${BASE_URL}/subscription/select-plan`,
  SIGNUP: `${BASE_URL}/auth/signup`,
};
