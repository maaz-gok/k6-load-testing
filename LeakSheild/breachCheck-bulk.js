import http from "k6/http";
import { check } from "k6";
import emails from "./Emails/emails.js";
import login from "./Login.js";

const BASE_URL = "https://api.aliengate.jp";
const BreachCheckBulkURL = `${BASE_URL}/breach/check-bulk`;

export function setup() {
  const token = login();
  console.log(`Login completed. Token received.`);
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

  // Send all emails in a single request
  const payload = JSON.stringify({
    emails: emails,
    includeUnverified: true,
  });

  const res = http.post(BreachCheckBulkURL, payload, params);

  console.log(`Breach Check Bulk Status: ${res.status} for ${emails.length} emails`);

  // Log jobId if present
  const resBody = JSON.parse(res.body);
  if (resBody?.data?.job?.id) {
    console.log(`Job created with ID: ${resBody.data.job.id}`);
  }

  // Simple check
  check(res, {
    "Breach Check Bulk status is 201 or 202": (r) => r.status === 201 || r.status === 202,
  });
}
