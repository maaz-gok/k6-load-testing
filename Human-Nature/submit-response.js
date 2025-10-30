import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";
import createGuest  from "./guest-signup.js";

export { options };

const BASE_URL = "https://api.humannatureapp.com";
const QuesID = "68f0932274d9506c680ddf0a";
const SubmitResponse = `${BASE_URL}/prompt/submit-response/${QuesID}`;

export default function () {
  const { token, user } = createGuest();

  if (!token) {
    console.error("Guest signup failed — no token received.");
    return;
  }

  const payload = {
    responseType: "Video",
    privacy: "Public",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    audioUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  };

  const res = http.post(SubmitResponse, JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  check(res, {
    "Submit Response status is 201": (r) => r.status === 201,
  });

  console.log(
    ` Guest ${user?.nameAlias} submitted response — Status: ${res.status}`
  );
}
