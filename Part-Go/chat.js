import http from "k6/http";
import { check, sleep } from "k6";
import login from "./login.js";
import { endpoints } from "./config/endpoints.js";
import { options } from "../Scenarios.js";
export { options };
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// -----------------------------
// Setup function to get auth tokens
// -----------------------------
export function setup() {
  const customerToken = login("maaz+user@geeksofkolachi.com", "Test123!");
  const vendorToken = login("maaz+vendor@geeksofkolachi.com", "Test123!");

  if (!customerToken || !vendorToken) {
    throw new Error("Tokens could not be retrieved!");
  }

  return { customerToken, vendorToken };
}

// -----------------------------
// Room ID and User IDs
// -----------------------------
const ROOM_ID = "695b632310b1a3f4849017bb";
const CUSTOMER_ID = "695755cb10b1a3f4848ff2c8";
const VENDOR_ID = "6957753810b1a3f4848ff358";

// -----------------------------
// Main test
// -----------------------------
export function chatFlow(data) {
  const { customerToken, vendorToken } = data;

  /* Customer sends message */
  const customerPayload = JSON.stringify({
    content: "Hello Vendor! This is a test message from Customer.",
  });
  const customerRes = http.post(endpoints.MESSAGES(ROOM_ID, CUSTOMER_ID), customerPayload, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${customerToken}` },
  });

  check(customerRes, {
    "Customer message sent successfully": (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);

  /* Vendor replies */
  const vendorPayload = JSON.stringify({
    content: "Hello Customer! This is a reply from Vendor.",
  });
  const vendorRes = http.post(endpoints.MESSAGES(ROOM_ID, VENDOR_ID), vendorPayload, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${vendorToken}` },
  });

  check(vendorRes, {
    "Vendor message sent successfully": (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}

// -----------------------------
// HTML Summary Report - Concise
// -----------------------------
export function handleSummary(data) {
  // Copy data and remove threshold info
  const reportData = JSON.parse(JSON.stringify(data));

  Object.keys(reportData.metrics).forEach((metric) => {
    if (reportData.metrics[metric].thresholds) {
      reportData.metrics[metric].thresholds = [];
    }
  });

  // Generate simple HTML using k6-reporter
  return {
    "summary.html": htmlReport(reportData),
  };
}
