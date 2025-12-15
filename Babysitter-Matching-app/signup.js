import http from "k6/http";
import { check } from "k6";
import { endpoints } from "./config/endpoints.js";
import { generateRandomEmail } from "../utils/RandomEmail.js";
import {options} from "../Scenarios.js";
export {options};
function getRole50_50() {
    return Math.random() < 0.5 ? "parent" : "sitter";
}

export default function () {
    const role = getRole50_50();

    const payload = {
        name: `${role}_user`,
        email: generateRandomEmail(),
        phone: "1234567890",
        password: "Test@1234",
        role: role,
        preferredLanguage: "en",
    };

    const res = http.post(
        endpoints.SIGNUP,
        JSON.stringify(payload),
        {
            headers: { "Content-Type": "application/json" },
        }
    );

    check(res, {
        [`Signup ${role} status is 201`]: (r) => r.status === 201,
    });
}
