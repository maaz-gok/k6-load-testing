import http from "k6/http";
import { check } from "k6";
import { options } from "../../Scenarios.js";
import login from "../login.js";
import { categories, tags, sampleQuestions } from "../CreateQuestions/data.js";


export { options };

const BASE_URL = "https://api.humannatureapp.com";
const CREATE_QUESTION = `${BASE_URL}/prompt/create-question`;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function setup() {
  const userToken = login("maaz+85@geeksofkolachi.com", "Nmdp7788!");

  if (!userToken) {
    throw new Error("Tokens could not be retrieved!");
  }

  return { userToken };
}
export default function (data) {
    const { userToken } = data;
    const randomQuestion = randomItem(sampleQuestions);
    const randomCategory = randomItem(categories);
    const randomTag = Array.from(new Set([randomItem(tags), randomItem(tags), randomItem(tags)]));
    
    const payload = JSON.stringify({
      question: randomQuestion,
      category: randomCategory,
      tags: randomTag,
    });
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    };
  
    const res = http.post(CREATE_QUESTION, payload, { headers: headers });
    console.log(`Create Question Response Status: ${res.status}`);
    check(res, {
      "Create Question status is 200": (r) => r.status === 200,
    });
  }