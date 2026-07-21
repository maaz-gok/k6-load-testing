import http from 'k6/http';
import { check, group, sleep } from 'k6';
import exec from 'k6/execution';

const CLIENT_ID = __ENV.CLIENT_ID;
const CLIENT_SECRET = __ENV.CLIENT_SECRET;
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN;

import { registerOptions as options } from '../Scenarios.js';

export { options };

import { ENDPOINTS } from './endpoints/index.js';

export default function () {
    // Use a large random number to ensure the email is truly unique on every run
    // Using VU and Iteration IDs causes conflicts when re-running local 1-VU tests
    const uniqueID = Math.floor(1000000000 + Math.random() * 9000000000);
    const uniqueEmail = `maaz+t4_${uniqueID}@geeksofkolachi.com`;

    // We use a small random number for the name (max 3 digits) so that the 
    // Gmail regex (which looks for 4-6 digits) doesn't accidentally pick up the name 
    // from the "Hi [Name]" greeting in the email as the OTP!
    const uniqueName = `Maaz Landlord ${Math.floor(Math.random() * 999)}`;

    const randomYear = Math.floor(Math.random() * (2000 - 1970 + 1)) + 1970;
    const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const uniqueDOB = `${randomMonth}/${randomDay}/${randomYear}`;

    let authToken = '';

    group('1. Register', function () {
        const payload = JSON.stringify({
            name: uniqueName,
            email: uniqueEmail,
            password: 'Test123!',
            role: 'LANDLORD',
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = http.post(ENDPOINTS.REGISTER, payload, params);

        check(res, {
            'Register status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        });

        console.log(`Register Response: ${res.body}`);
    });

    sleep(1); // Think time

    group('2. Verify Signup OTP', function () {
        // 1. Get OTP via Gmail API (Polling)
        let tokenRes = http.post("https://oauth2.googleapis.com/token", {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: "refresh_token",
        });

        let accessToken = tokenRes.json().access_token;

        const searchQuery = `"${uniqueEmail}" in:anywhere newer_than:5m`;
        const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=1`;

        let extractedOtp = "";

        for (let i = 1; i <= 15; i++) {
            sleep(5);

            let searchRes = http.get(searchUrl, { headers: { Authorization: `Bearer ${accessToken}` } });

            if (searchRes.status === 429) {
                console.warn(`Gmail API Rate Limited (429)! Retrying... (Attempt ${i}/15)`);
                sleep(5);
                continue;
            }

            let messages = searchRes.json().messages;

            if (messages && messages.length > 0) {
                let msgId = messages[0].id;
                let msgDetails = http.get(
                    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                let snippet = msgDetails.json().snippet;
                let match = snippet.match(/(?:\d\s*){4,6}/);
                if (match) {
                    extractedOtp = match[0].replace(/\s/g, "");
                    break;
                }
            }
        }

        if (!extractedOtp) {
            console.error(`FAILED: OTP not found for ${uniqueEmail}.`);
            return; // Exits the group early
        }

        const payload = JSON.stringify({
            email: uniqueEmail,
            otp: extractedOtp,
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = http.post(ENDPOINTS.VERIFY_OTP, payload, params);

        check(res, {
            'Verify OTP status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        });

        console.log(`Verify OTP Response: ${res.body}`);
    });

    sleep(1);

    group('2.5. Login', function () {
        const payload = JSON.stringify({
            email: uniqueEmail,
            password: 'Test123!',
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const res = http.post(ENDPOINTS.LOGIN, payload, params);

        check(res, {
            'Login status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        });

        console.log(`Login Response: ${res.body}`);

        try {
            const body = res.json();
            if (body && body.accessToken) {
                authToken = body.accessToken;
            } else if (body && body.data && body.data.accessToken) {
                authToken = body.data.accessToken;
            } else if (body && body.token) {
                authToken = body.token;
            } else if (body && body.data && body.data.token) {
                authToken = body.data.token;
            }
        } catch (e) {
            // Ignore JSON parse errors
        }
    });

    sleep(1);

    group('3. Onboarding', function () {
        // Excluding inviteCode and lease as requested
        const payload = JSON.stringify({
            address: '123 Main St, Brooklyn, NY',
            dateOfBirth: uniqueDOB,
        });

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Inject the Bearer token if we got one from the OTP verification step
        if (authToken) {
            params.headers['Authorization'] = `Bearer ${authToken}`;
        }

        const res = http.post(ENDPOINTS.ONBOARDING, payload, params);

        check(res, {
            'Onboarding status is 200 or 201': (r) => r.status === 200 || r.status === 201,
        });

        if (res.status !== 200 && res.status !== 201) {
            console.error(`Onboarding Failed! Status: ${res.status}, Body: ${res.body}`);
        }
    });

    sleep(1);
}
