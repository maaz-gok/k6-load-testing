import http from "k6/http";
import { check } from "k6";

const BASE_URL = "https://api.humannatureapp.com";
const GuestSignup = `${BASE_URL}/auth/signup-guest`;

function generateRandomAlias() {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `Guest${timestamp}_${randomNumber}`;
}

export default function createGuest() {
  const guestDetails = {
    provider: "Custom",
    fullName: "John Doe",
    age: 35,
    profilePicture: "string",
    country: "United States",
    preferredLanguage: "English",
    interests: ["Belief", "Love"],
    privacyMode: "Public",
    promptSettings: "Daily",
    nameAlias: generateRandomAlias(),
  };

  const res = http.post(GuestSignup, JSON.stringify(guestDetails), {
    headers: { "Content-Type": "application/json" },
  });
  console.log(` Guest signup — Status: ${res.status}`);

  check(res, { "Guest signup status is 201": (r) => r.status === 201 });

  const body = JSON.parse(res.body);
  const token = body?.data?.token;
  const user = body?.data?.user;

  return { token, user };
}
