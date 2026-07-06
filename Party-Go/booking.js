import http from "k6/http";
import { check, sleep } from "k6";
import login from "./login.js";
import { endpoints } from "./config/endpoints.js";
import { options } from "../Scenarios.js";
export { options };
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// -----------------------------
// 1️⃣ Setup: Login once
// -----------------------------
export function setup() {
  const token = login("maaz+load@geeksofkolachi.com", "Test123!");
  if (!token) throw new Error("❌ Login failed");
  console.log("✅ Login successful");
  return { token };
}

// -----------------------------
// 2️⃣ Default function: run for each VU
// -----------------------------
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    "Content-Type": "application/json",
  };

  const listingsRes = http.get(endpoints.LISTINGS, { headers });
  check(listingsRes, { "Listings fetched": (r) => r.status === 200 });

  const listings = listingsRes.json()?.data?.listings;
  if (!listings?.length) return;

  const listing = listings[Math.floor(Math.random() * listings.length)];

  const bookingPayload = {
    listingId: listing._id,
    rateType: listing.rateType,
    date: "2026-02-10",
    time: "18:00",
    specialRequests: "Load test booking",
    price: listing.rate,
    isPaid: false,
    status: "new_requests",
    customerAddress: {   // always include to prevent 400
      latitude: 24.8607,
      longitude: 67.0011,
      address: "Karachi, Pakistan",
    },
  };

  // duration only for perHour listings
  if (listing.rateType === "perHour") {
    bookingPayload.duration = "2 hours";
  }

  //console.log("Booking payload:", JSON.stringify(bookingPayload, null, 2));

  const bookingRes = http.post(
    endpoints.BOOKINGS,
    JSON.stringify(bookingPayload),
    { headers }
  );

  //console.log("Booking response:", bookingRes.status, bookingRes.body);

  check(bookingRes, { "Booking created": (r) => r.status === 200 || r.status === 201 });

  sleep(1);
}

// -----------------------------
// 3️⃣ Summary report (HTML)
// -----------------------------
export function handleSummary(data) {
  return {
    "summary.html": htmlReport(data),
  };
}
