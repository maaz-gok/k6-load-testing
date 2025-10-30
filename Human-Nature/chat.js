import http from "k6/http";
import { check, sleep } from "k6";
import { options } from "../Scenarios.js";
import login from "./login.js"; 

export { options };

const BASE_URL = "https://api.humannatureapp.com";
const Chat = `${BASE_URL}/chat/private/send`;

export function setup() {
  const user1Token = login("maaz+130@geeksofkolachi.com","Nmdp7788!");
  const user2Token = login("maaz+140@geeksofkolachi.com","Nmdp7788@");

  if (!user1Token || !user2Token) {
    throw new Error("Tokens could not be retrieved!");
  }

  return { user1Token, user2Token };
}

export default function (data) {
  const { user1Token, user2Token } = data;

  const user1Payload = JSON.stringify({
    senderId: "68ec9fdd07ea8b825c84c8dd",
    recipientId: "68eca01f07ea8b825c84c8e7",
    content: "Message From A32 - Testing Chat",
  });

  const user1Headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user1Token}`,
  };

  const res1 = http.post(Chat, user1Payload, { headers: user1Headers });
  console.log(`User 1 Response Status: ${res1.status}`);
  check(res1, {
    "User 1 chat status is 201": (r) => r.status === 201,
  });

  sleep(1);

  const user2Payload = JSON.stringify({
    senderId: "68eca01f07ea8b825c84c8e7",
    recipientId: "68ec9fdd07ea8b825c84c8dd",
    content: "Reply From A15 - Maaz Testing Chat",
  });

  const user2Headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user2Token}`,
  };

  const res2 = http.post(Chat, user2Payload, { headers: user2Headers });
  console.log(`User 2 Response Status: ${res2.status}`);
  check(res2, {
    "User 2 chat status is 201": (r) => r.status === 201,
  });

  sleep(1);
}
