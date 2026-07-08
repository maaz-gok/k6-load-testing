import http from "k6/http";
import { check, sleep } from "k6";
import { ENDPOINTS } from "./endpoints/index.js";
export const options = {
    vus: 1,
    iterations: 10,
};

export function setup() {
    const loginPayload = JSON.stringify({
        email: "maaz+c10@geeksofkolachi.com",
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

    const cars = [
        { make: "Toyota", model: "Corolla", image: "dealer-inventory/f3437573-a338-4228-bd57-6b5015ceecde.png" },
        { make: "Honda", model: "Civic", image: "dealer-inventory/87909ff5-bd6b-4fe1-8ef9-d70bfc473889.png" },
        { make: "Honda", model: "City", image: "dealer-inventory/fee443de-ab23-473a-b973-c727abcb401d.png" },
        { make: "Toyota", model: "Yaris", image: "dealer-inventory/cdbc3c92-463c-49da-be2a-61f045c74d84.png" },
        { make: "Hyundai", model: "Sonata", image: "dealer-inventory/9ad8ba89-eaaf-4c86-8ee9-c48221d6bae5.png" },
    ];
    
    const randCar = cars[Math.floor(Math.random() * cars.length)];
    // Make VIN completely unique to avoid 409 collisions (Max 17 chars)
    const timeStr = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const randStr = Math.floor(10000 + Math.random() * 90000).toString(); // 5 random digits
    const randomVIN = `VIN${timeStr}${randStr}`; // Total 16 chars

    const vehiclePayload = JSON.stringify({
        thumbnail: randCar.image,
        photos: [
            randCar.image,
            randCar.image
        ],
        description: `This is a great ${randCar.make} ${randCar.model} for sale!`,
        vehicleName: `${randCar.make} ${randCar.model}`,
        vehicleType: "sedan",
        make: randCar.make,
        model: randCar.model,
        trim: "LE",
        color: "Black",
        price: `${Math.floor(10000 + Math.random() * 40000)}`,
        mileage: `${Math.floor(5000 + Math.random() * 100000)}`,
        vin: randomVIN,
        titleStatus: "clean",
        soldStatus: "un_sold", 
        activeStatus: "active"
    });

    let res = http.post(ENDPOINTS.CUSTOMER_LISTINGS, vehiclePayload, { headers });
    
    let success = check(res, {
        "Listing Added": (r) => r.status === 200 || r.status === 201
    });

    if (!success) {
        if (res.status === 502) {
            console.error(`[502 BAD GATEWAY] Request took ${res.timings.duration}ms`);
            console.error(`[502 HEADERS]: ${JSON.stringify(res.headers)}`);
            console.error(`[502 BODY]: ${res.body.substring(0, 500)}`); // Nginx/Cloudflare HTML
        } else {
            console.error(`Add Listing Failed: ${res.status} ${res.body.substring(0, 200)}`);
        }
    }

    sleep(1); // Small wait time between additions per VU
}
