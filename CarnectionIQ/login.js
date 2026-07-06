import http from "k6/http";
import { sleep, check } from "k6";
import { ENDPOINTS } from "./endpoints/index.js";
import { options } from "../Scenarios.js";


export { options };

export default function () {
    const res = http.post(ENDPOINTS.LOGIN, {
        email: "maaz+dealer@geeksofkolachi.com",
        password: "Test123!",
    });
    // Validations / Assertions
    check(res, {
        "status is 201": (r) => r.status === 201,
    });
    sleep(1);
}