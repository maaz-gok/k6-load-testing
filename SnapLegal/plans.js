import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { endpoints } from "./config/endpoints.js";

export { options };

export default function () {
  const res = http.get(endpoints.GET_PLANS);

  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${res.body}`);

  check(res, {
    "Get Plans status is 200": (r) => r.status === 200,
  });
}
