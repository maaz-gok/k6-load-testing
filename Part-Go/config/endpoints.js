const BASE_URL = "https://api-partygo.clienturl.net";

export const endpoints = {
  SIGNUP: `${BASE_URL}/auth/signup`,
  LOGIN: `${BASE_URL}/auth/login`,
  LISTINGS: `${BASE_URL}/listings`,
  BOOKINGS: `${BASE_URL}/bookings`,

  MESSAGES: (roomId, userId) =>
    `${BASE_URL}/chat/rooms/${roomId}/messages?userId=${userId}`,
};
