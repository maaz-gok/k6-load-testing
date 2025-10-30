import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import login from "./SignUpLogin.js";
import { endpoints } from "./config/endpoints.js";

export { options };

export default function () {
  const token = login();
  if (!token) {
    console.error("Login failed — no token returned");
    return;
  }

  const payload = JSON.stringify({
    paymentPriceId: "price_1SAfcgPziWHV3gbdQDIyF27R",
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const res = http.post(endpoints.SELECT_PLAN, payload, { headers });

  check(res, {
    "Select Plan status is 201": (r) => r.status === 201,
  });

  console.log(`Response Status: ${res.status}`);
}
