import http from "k6/http";
import { check } from "k6";
import { options } from "../Scenarios.js";

export { options };

const BASE_URL = "https://api.humannatureapp.com";
const LoginURL = `${BASE_URL}/auth/login`;

export default function login(email, password) {
  const LoginDetails = {
    email: email,
    password: password,
  };

  const loginRes = http.post(LoginURL, JSON.stringify(LoginDetails), {
    headers: { "Content-Type": "application/json" },
  });

  console.log(`Login Response Status: ${loginRes.status}`);

  check(loginRes, {
    "Login status is 200": (r) => r.status === 200,
  });

  const body = loginRes.json();
  const token = body?.data?.token || body?.token;
  return token;
}

// import http from "k6/http";
// import { check } from "k6";
// // import { options } from "../scenarios.js";

// // export { options };

// const BASE_URL = "https://api.humannatureapp.com";
// const LoginURL = `${BASE_URL}/auth/login`;

// export default function login() {
//   const LoginDetails = {
//     email: "maaz@geeksofkolachi.com",
//     password: "Nmdp7788!",
//   };

//   const loginRes = http.post(LoginURL, JSON.stringify(LoginDetails), {
//     headers: { "Content-Type": "application/json" },
//   });

//   console.log(`Login Response Status: ${loginRes.status}`);

//   check(loginRes, {
//     "Login status is 200": (r) => r.status === 200,
//   });

//   const body = loginRes.json();
//   const token = body?.data?.token || body?.token;

//   return token;
// }
