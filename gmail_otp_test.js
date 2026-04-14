import http from "k6/http";
import { sleep, check } from "k6";
// import { options } from "./Scenarios.js";
// export {options}

// --- GMAIL CONFIGURATION ---
const CLIENT_ID = __ENV.CLIENT_ID;
const CLIENT_SECRET = __ENV.CLIENT_SECRET;
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN;

export default function () {
  // Unique data generate karna taake test repeat ho sake
  const uniqueID = Math.floor(Date.now() / 1000);
  const testEmail = `maaz+tester${uniqueID}@geeksofkolachi.com`;
  const testPhone = `+923${Math.floor(10000000 + Math.random() * 90000000)}`; // Random Pak number

  const commonHeaders = { "Content-Type": "application/json" };

  // --- STEP 1: SIGNUP (APKA ACTUAL PAYLOAD) ---
  console.log(`1. Signing up as VENDOR: ${testEmail}`);
  const signupUrl = "https://api-partygo.clienturl.net/auth/signup";

  const signupPayload = JSON.stringify({
    fullName: "Maaz Tester",
    email: testEmail,
    password: "SecurePassword123!",
    phoneNumber: testPhone,
    role: "VENDOR",
  });

  let signupRes = http.post(signupUrl, signupPayload, {
    headers: commonHeaders,
  });

  check(signupRes, {
    "Signup Successful (200/201)": (r) => r.status === 200 || r.status === 201,
  });

  // --- STEP 2: WAIT FOR OTP ---
  console.log("2. Waiting 15 seconds for Gmail to sync...");
  sleep(15);

  // --- STEP 3: GET OTP FROM GMAIL ---
  let tokenRes = http.post("https://oauth2.googleapis.com/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: "refresh_token",
  });
  let accessToken = tokenRes.json().access_token;

  // Filter by specific unread email
  const searchQuery = `to:${testEmail} in:anywhere`;
  let searchRes = http.get(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  let extractedOtp = "";
  if (searchRes.json().messages && searchRes.json().messages.length > 0) {
    let msgId = searchRes.json().messages[0].id;
    let msgDetails = http.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    // Snippet se 6 digit code extract karna
    let match = msgDetails.json().snippet.match(/\d{6}/);
    if (match) extractedOtp = match[0];
  }

  // --- STEP 4: VERIFY OTP ---
  if (extractedOtp) {
    console.log(`3. OTP Found: ${extractedOtp}. Verifying now...`);
    const verifyUrl =
      "https://api-partygo.clienturl.net/auth/verify-signup-otp";
    const verifyPayload = JSON.stringify({
      email: testEmail,
      otp: extractedOtp,
    });

    let verifyRes = http.post(verifyUrl, verifyPayload, {
      headers: commonHeaders,
    });

    check(verifyRes, {
      "OTP Verified Successfully": (r) => r.status === 201,
    });
    console.log(
      `4. Final Status: ${verifyRes.status === 201 ? "SUCCESS" : "FAILED"}`,
    );
  } else {
    console.error(`FAILED: OTP not found for ${testEmail}.`);
  }
}
