import http from "k6/http";
import { sleep, check } from "k6";
import { ENDPOINTS } from "./endpoints/index.js";
import { signupOptions as options } from "../Scenarios.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export { options };

const CLIENT_ID = __ENV.CLIENT_ID;
const CLIENT_SECRET = __ENV.CLIENT_SECRET;
const REFRESH_TOKEN = __ENV.REFRESH_TOKEN;

export default function () {
    const uniqueID = Math.floor(1000000000 + Math.random() * 9000000000);
    const testEmail = `maaz+dealer${uniqueID}@geeksofkolachi.com`;
    const testPhone = `+1212555${Math.floor(1000 + Math.random() * 9000)}`;
    const commonHeaders = { "Content-Type": "application/json" };

    // ==========================================
    // 1. SIGNUP
    // ==========================================
    const signupPayload = JSON.stringify({
        firstName: "Maaz",
        lastName: "Imtiaz",
        email: testEmail,
        password: "SecurePassword123!",
        phone: testPhone,
        role: "DEALER",
        zipCode: "10001",
        address: "123 Main St, New York, NY"
    });

    let signupRes = http.post(ENDPOINTS.SIGNUP, signupPayload, { headers: commonHeaders });
    let signupSuccess = check(signupRes, { "Signup Successful": (r) => r.status === 200 || r.status === 201 });
    
    if (!signupSuccess) {
        console.error(`Signup failed: ${signupRes.status} ${signupRes.body.substring(0, 200)}`);
        return;
    }

    // ==========================================
    // 2. GET OTP FROM GMAIL (with polling)
    // ==========================================
    let tokenRes = http.post("https://oauth2.googleapis.com/token", {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: "refresh_token",
    });
    let accessToken = tokenRes.json().access_token;

    const searchQuery = `"${testEmail}" in:anywhere newer_than:5m`;
    const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=1`;

    let extractedOtp = "";

    for (let i = 1; i <= 15; i++) {
        sleep(5);

        let searchRes = http.get(searchUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
        
        if (searchRes.status === 429) {
            console.warn(`Gmail API Rate Limited (429)! Retrying... (Attempt ${i}/15)`);
            sleep(5); // extra sleep for rate limit
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
        console.error(`FAILED: OTP not found for ${testEmail}.`);
        return;
    }

    // ==========================================
    // 3. VERIFY OTP
    // ==========================================
    const verifyPayload = JSON.stringify({ email: testEmail, otp: extractedOtp });

    let verifyRes = http.post(ENDPOINTS.VERIFY_OTP, verifyPayload, { headers: commonHeaders });
    let verifySuccess = check(verifyRes, { "OTP Verified Successfully": (r) => r.status === 200 || r.status === 201 });

    if (!verifySuccess) {
        console.error("FAILED: OTP Verification failed.");
        return;
    }

    // Grab auth token from verify response
    let authToken = verifyRes.json("token") || verifyRes.json("access_token") || verifyRes.json("data.token");
    let onboardHeaders = { "Content-Type": "application/json" };
    if (authToken) {
        onboardHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    // ==========================================
    // 4. ONBOARDING
    // ==========================================
    const onboardPayload = JSON.stringify({
        ownerFullName: "Maaz Imtiaz",
        managerFullName: "Afnan Iqbal",
        dealershipEmail: testEmail,
        businessPhone: testPhone,
        approximateInventoryCount: 50,
        dealerLicenseNumber: `LIC${Math.floor(10000 + Math.random() * 90000)}`,
        dealershipAddress: "123 Main St, New York, NY",
        zip: "10001",
        dealershipName: `Maaz Auto Dealership ${uniqueID}`,
        driversLicense: "https://dummyimage.com/600x400/cccccc/000000.jpg&text=Drivers+License",
        activeDealerLicense: "https://dummyimage.com/600x400/cccccc/000000.jpg&text=Dealer+License",
        proofOfDealership: "https://dummyimage.com/600x400/cccccc/000000.jpg&text=Proof+Of+Dealership",
        agreement: true
    });

    let onboardRes = http.post(ENDPOINTS.ONBOARDING, onboardPayload, { headers: onboardHeaders });
    let onboardSuccess = check(onboardRes, { "Onboarding Successful": (r) => r.status === 200 || r.status === 201 });

    if (!onboardSuccess) {
        console.error(`Onboarding failed: ${onboardRes.status} ${onboardRes.body.substring(0, 500)}`);
        return;
    }

    // ==========================================
    // 5. GET SUBSCRIPTION PLANS
    // ==========================================
    const plansRes = http.get(`${ENDPOINTS.SUBSCRIPTION_PLANS}?role=dealer`, { headers: onboardHeaders });
    check(plansRes, { "Fetched Plans Successfully": (r) => r.status === 200 });

    // ==========================================
    // 6. GENERATE CHECKOUT SESSION
    // ==========================================
    const checkoutPayload = JSON.stringify({
        priceId: "price_1Tjh8jK7VBcgiFVsUDT1htV0",
        successUrl: "https://app.dev.carnectioniq.com/dealer/onboarding/subscription?success=true",
        cancelUrl: "https://app.dev.carnectioniq.com/dealer/onboarding/subscription"
    });

    const checkoutRes = http.post(ENDPOINTS.SUBSCRIPTION_CHECKOUT, checkoutPayload, { headers: onboardHeaders });
    const checkoutSuccess = check(checkoutRes, { "Checkout Session Created": (r) => r.status === 200 || r.status === 201 });

    if (!checkoutSuccess) {
        console.error(`Checkout failed: ${checkoutRes.status} ${checkoutRes.body.substring(0, 200)}`);
    }

    // ==========================================
    // 7. SIMULATE PAYMENT WEBHOOK
    // ==========================================
    let sessionId = "cs_test_mock123";
    try {
        const checkoutData = checkoutRes.json();
        if (checkoutData && checkoutData.id) sessionId = checkoutData.id;
        else if (checkoutData && checkoutData.data && checkoutData.data.id) sessionId = checkoutData.data.id;
    } catch (e) { }

    const mockWebhookPayload = JSON.stringify({
        id: "evt_test_mock456",
        object: "event",
        type: "checkout.session.completed",
        data: {
            object: {
                id: sessionId,
                object: "checkout.session",
                payment_status: "paid",
                status: "complete",
            }
        }
    });

    const webhookHeaders = {
        "Content-Type": "application/json",
        "Stripe-Signature": "t=1620000000,v1=dummy_signature_for_testing"
    };

    const webhookRes = http.post(ENDPOINTS.STRIPE_WEBHOOK, mockWebhookPayload, { headers: webhookHeaders });
    check(webhookRes, { "Webhook Processed (Might fail on Signature)": (r) => r.status === 200 || r.status === 201 });

    sleep(1);
}

export function handleSummary(data) {
    return {
        "Reports/signup-onboarding-summary.html": htmlReport(data),
    };
}