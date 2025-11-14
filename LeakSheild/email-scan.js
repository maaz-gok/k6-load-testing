import http from 'k6/http';
import { check, sleep } from 'k6';
import login from "./Login.js";
import emailsScan from "./Emails/emails.js";
import { endpoints } from "./config/endpoints.js";


export function setup() {
  const token = login();
  return { token };
}

export default function (data) {
  const token = data.token;

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // Iterate over each email
  for (let i = 0; i < emailsScan.length; i++) {
    const email = emailsScan[i];

    const payload = {
      email: email, 
    };

    const res = http.post(endpoints.EMAIL_SCAN, JSON.stringify(payload), params);

    console.log(`Email ${i + 1}/${emailsScan.length} -> ${email} Status: ${res.status}`);
    console.log(`Response Body: ${res.body}`);

    check(res, {
      "Breach Check request accepted": (r) => r.status === 200 || r.status === 201,
    });

    
    sleep(0.5); 
  }
}
