import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { endpoints } from "./config/endpoints.js";

export { options };

const token = __ENV.GOOGLE_TOKEN;

export default function () {
  const payload = JSON.stringify({ token });

  const res = http.post(endpoints.CALL_BACK, payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "Callback status is 201": (r) => r.status === 201,
  });

 console.log(`Response Status: ${res.status}`);
 
}
