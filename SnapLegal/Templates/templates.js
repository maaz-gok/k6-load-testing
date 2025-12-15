import http from "k6/http";
import { check, sleep } from "k6";
import { options } from "../../Scenarios.js";
import login from "../login.js";
import { payloads } from "./data/payloads.js";
import { templateIds } from "./data/data.js";
import { endpoints } from "../config/endpoints.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export { options };

// Setup runs once before any VUs start
export function setup() {
  const token = login();
  if (!token) {
    throw new Error("❌ Login failed — no token returned in setup");
  }
  console.log("✅ Logged in successfully — token acquired");
  return { token };
}

export default function (data) {
  const { token } = data;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const templateId =
    templateIds[Math.floor(Math.random() * templateIds.length)];

  // 1️⃣ Fetch Questions
  const questionsRes = http.get(endpoints.GET_QUESTIONS(templateId), {
    headers,
  });
  check(questionsRes, {
    [`${templateId} — questions fetched successfully`]: (r) => r.status === 200,
  });

  // 2️⃣ Submit Responses
  const payload = payloads[templateId];
  if (!payload) {
    console.error(`No payload found for templateId: ${templateId}`);
    return;
  }

  const submitRes = http.post(
    endpoints.SUBMIT_RESPONSES,
    JSON.stringify(payload),
    { headers }
  );

  check(submitRes, {
    [`${templateId} — responses submitted`]: (r) => r.status === 201,
  });

  const parsedSubmitBody = JSON.parse(submitRes.body);

  // 💡 ROBUST ID EXTRACTION: Check for both responseId and rootResponseId in the submission body.
  const submissionData = parsedSubmitBody?.data;
  const docId = submissionData?.rootResponseId || submissionData?._id || submissionData?.responseId; 

  if (!docId) {
    console.error(`❌ Missing document ID for template ${templateId}. Body: ${submitRes.body}`);
    return;
  }
  
  // 3️⃣ Generate Document
  // Use the original key 'rootResponseId' as confirmed by the user, and ensure ID is a string.
  const genDocPayload = {
    responseId: String(docId),
  };

  const genDocRes = http.post(
    endpoints.GENERATE_DOC,
    JSON.stringify(genDocPayload),
    { headers }
  );

  const success = check(genDocRes, {
    [`✅ ${templateId} — document generated`]: (r) => r.status === 201,
  });

  if (!success) {
    console.error(`\n❌ ${templateId} — Document generation failed`);
    console.error(`↳ Status: ${genDocRes.status}`);
    console.error(`↳ Duration: ${genDocRes.timings.duration} ms`);
    console.error(`↳ Template Response ID: ${submissionData?._id}`);
    console.error(`↳ GenDoc Request ID: ${docId}`);
    console.error(`↳ Body: ${genDocRes.body}`);
    console.error(`↳ Request payload: ${JSON.stringify(genDocPayload)}`);
  }

  console.log(`Template ${templateId} → Gen Doc Status: ${genDocRes.status}`);
  sleep(1);
}
export function handleSummary(data) {
  return {
    ".summary.html": htmlReport(data),
  };
}