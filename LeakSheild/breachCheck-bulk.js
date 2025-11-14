import http from "k6/http";
import { check, sleep } from "k6";
import emails from "./Emails/emails.js";
import login from "./Login.js";
import { endpoints } from "./config/endpoints.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

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

  const payload = JSON.stringify({
    emails: emails,
    includeUnverified: true,
  });

  // First API call
  const res = http.post(endpoints.BREACH_CHECK_BULK, payload, params);
  console.log(
    `Breach Check Bulk Status: ${res.status} for ${emails.length} emails`
  );

  const resBody = JSON.parse(res.body);
  let jobId = null;

  if (resBody?.data?.job?.id) {
    jobId = resBody.data.job.id;
    console.log(`Job created with ID: ${jobId}`);
  } else {
    console.error("Job ID not found in response!");
    return; // stop if no jobId
  }

  // Poll the job status every 15 seconds until it's completed
  const jobStatusUrl = `${endpoints.BREACH_CHECK_BULK}/status/${jobId}`;
  let jobStatus = null;

  while (true) {
    const jobRes = http.get(jobStatusUrl, params);
    const jobBody = JSON.parse(jobRes.body);
    jobStatus = jobBody?.data?.status;

    console.log(`Job Status API Response: ${jobRes.status}`);
    //console.log(`Job Status Response Body: ${jobRes.body}`);
    console.log(`Current job status: ${jobStatus}`);

    // Stop polling when status is "completed"
    if (jobStatus === "completed") {
      console.log(`Job ${jobId} completed!`);
      break;
    }

    // Wait 15 seconds before next poll
    sleep(15);
  }

  // Optional: check for first response
  check(res, {
    "Breach Check Bulk status is 201 or 202": (r) =>
      r.status === 201 || r.status === 202,
  });
}

export function handleSummary(data) {
  return {
    "Report.html": htmlReport(data),
  };
}
