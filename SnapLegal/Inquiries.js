import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { endpoints } from "./config/endpoints.js";

export { options };

function generateRandomEmail() {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 1000000);
  return `john+${timestamp}_${randomNumber}@example.com`;
}

export default function () {
  const inquiryPayload = {
    name: "Maaz Imtiaz",
    companyName: "GOK",
    email: generateRandomEmail(),
    message: "I would like to discuss a potential partnership opportunity...",
    reason: "general_question",
  };
  const res = http.post(endpoints.INQUIRIES, JSON.stringify(inquiryPayload), {
    headers: { "Content-Type": "application/json" },
  });
  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${res.body}`);

  check(res, {
    "Inquiry status is 201": (r) => r.status === 201,
  });
}
