import http from "k6/http";
import { check } from "k6";
import login from "./Login.js";


const BASE_URL = "https://api.aliengate.jp";
const BreachCheckBulkURL = `${BASE_URL}/breach/check`;

// setup runs once
export function setup() {
  const token = login();
  return { token };
}

export default function (data) {
  const token = data.token;

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const payload = JSON.stringify({
    email: "maaz+33@geeksofkolachi.com",
    includeUnverified: true,
  });
  const res = http.post(BreachCheckBulkURL, payload, params);

  check(res, {
    "Breach Check Bulk - status is 201": (r) => r.status === 201,
  });

  console.log(`Breach Check Bulk Response Status: ${res.status} for 1 email`);
}
