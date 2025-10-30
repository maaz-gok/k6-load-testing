import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { login } from "./login.js"; 

export { options };

const BASE_URL = "https://api.humannatureapp.com";
const Notifications = `${BASE_URL}/notifications?page=1&limit=30`;

export default function () {
  const token = login();
  const res = http.get(Notifications, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${res.body}`);

  check(res, {
    "Get Notifications status is 200": (r) => r.status === 200,
  });
}
