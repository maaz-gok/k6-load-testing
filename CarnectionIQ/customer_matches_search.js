import http from "k6/http";
import { check, sleep } from "k6";
import { ENDPOINTS } from "./endpoints/index.js";

export const options = {
    vus: 1,
    iterations: 5, // Feel free to adjust Virtual Users and iterations
};

export function setup() {
    // Logging in as a customer (based on the email seen in the screenshot)
    const loginPayload = JSON.stringify({
        email: "maaz+customer@geeksofkolachi.com",
        password: "Test123!",
    });

    const headers = { "Content-Type": "application/json" };
    const res = http.post(ENDPOINTS.LOGIN, loginPayload, { headers });

    check(res, { "Login Successful": (r) => r.status === 200 || r.status === 201 });

    let token = res.json("token") || res.json("access_token") || res.json("data.token");
    if (!token) {
        console.error("Login failed or token not found!", res.body);
    }
    return { token: token };
}

export default function (data) {
    if (!data.token) {
        return; // Abort if setup failed
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${data.token}`
    };

    // Using the payload format seen in the frontend network tab screenshot
    const searchPayload = JSON.stringify({
        vehicleType: "suv",
        priceMin: 10,
        priceMax: 1000000
    });

    const res = http.post(ENDPOINTS.CUSTOMER_MATCHES_SEARCH, searchPayload, { headers });

    // Validate the response
    check(res, {
        "Search Status is 200 or 201": (r) => r.status === 200 || r.status === 201,
        "Response is not empty": (r) => r.body.length > 0
    });

    sleep(1); // Simulate think time between requests
}
