import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import { endpoints } from "../config/endpoints.js";
export { options };
const token =
  "ya29.A0AQQ_BDRoa1u20bOxa4CZKtXe8CyKF74KnZFelZ98xsN_tNSTxQvzhKoWKekMMf_9lkWjUcoTZ93ehV0rc6iYtpjdzzuPyBoQAbireUDF1687hNM3aV1zWJuMPdxvBbVrHqdcANo3nkSffx_pYCPTOmb2zTgGKymmNCorLBwIOXbjLUgQnJkjKXLP1Y0pdkcCSnvbOH-dane_ha72HTp44lMliE1jShZAeX8XxbR71TsswBfZTocNxMYLzrZzGruaXSGBzv9Fh4QXarFv-3dfY--pLB8qbAaCgYKAfgSARMSFQHGX2Mih0YIYk5IlaB1-1AUSvCD2w0293";

export default function () {
  const payload = JSON.stringify({ token });

  const res = http.post(endpoints.CALL_BACK, payload, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "Callback status is 201": (r) => r.status === 201,
  });

  console.log(`Response Status: ${res.status}`);
  console.log(`Response Body: ${res.body}`);
}
