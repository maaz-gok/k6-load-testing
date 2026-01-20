import http from "k6/http";
import { check, sleep } from "k6";
import { generateRandomEmail } from "../utils/RandomEmail.js";
import { endpoints } from "./config/endpoints.js";
import { options } from "../Scenarios.js";

export { options };

/**
 * Main Signup Logic
 * @param {string} role - "CUSTOMER" or "VENDOR"
 */
function signup(role) {
    const roleName = role || "VENDOR";

    const payload = {
        fullName: roleName === "CUSTOMER" ? "Test Customer" : "Test Vendor",
        email: generateRandomEmail(),
        password: "Test123!",
        phoneNumber: `+92${Math.floor(Math.random() * 900000000 + 100000000)}`,
        role: roleName.toUpperCase(),
    };

    const params = {
        headers: { "Content-Type": "application/json" },
        timeout: "15s",
    };

    // 1. Send the Request
    const res = http.post(endpoints.SIGNUP, JSON.stringify(payload), params);

    // 2. Run Checks
    const success = check(res, {
        "is status 200 or 201": (r) => r.status === 200 || r.status === 201,
        "transaction time < 2s": (r) => r.timings.duration < 2000,
    });

    // 3. Enhanced Logging for Errors
    if (!success) {
        // This will print the actual error message from your server to help you fix the 500
        console.error(
            `ERRO - Signup Failed | Email: ${payload.email} | Status: ${res.status} | Body: ${res.body}`
        );
    } else {
        console.info(`INFO - Signup Success | Email: ${payload.email}`);
    }
}

/**
 * The flow function k6 will execute
 */
export function signupFlow() {
    // Determine role
    const role = Math.random() < 0.5 ? "CUSTOMER" : "VENDOR";
    
    // Execute Signup
    signup(role);

    // --- IMPORTANT: Think Time ---
    // Without this, one VU will attack the server as fast as possible.
    // We add a 1-second pause between each user's signup attempt.
    sleep(1);
}