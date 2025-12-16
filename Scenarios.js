// export const options = {
//   scenarios: {
//     wave1: {
//       executor: 'constant-vus',
//       vus: 2,
//       duration: '180s',
//       startTime: '0s',
//     },
//     wave2: {
//       executor: 'constant-vus',
//       vus: 10,
//       duration: '180s',
//       startTime: '10s',
//     },
//     wave3: {
//       executor: 'constant-vus',
//       vus: 15,
//       duration: '180s',
//       startTime: '30s',
//     },
//     wave4: {
//       executor: 'constant-vus',
//       vus: 17,
//       duration: '180s',
//       startTime: '40s',
//     },
//     wave5: {
//       executor: 'constant-vus',
//       vus: 15,
//       duration: '180s',
//       startTime: '55s',
//     },
//   },
// };

// export const options = {
//   scenarios: {
//     spike: {
//       executor: 'ramping-vus',
//       startVUs: 0,
//       stages: [
//         { duration: '10s', target: 0 },
//         { duration: '10s', target: 500 },
//         { duration: '2m', target: 500 },
//         { duration: '10s', target: 0 },
//       ],
//     },
//   },
// };

// export const options = {
//   scenarios: {
//     normalLoad: {
//       executor: 'constant-arrival-rate',
//       rate: 50,             // 50 requests per second
//       timeUnit: '1s',
//       duration: '1m',       // Run for 1 minute
//       preAllocatedVUs: 20,
//       maxVUs: 100,
//     },
//   },
// };

// export const options = {
//   vus: 50,            // 100 VUs active simultaneously
//   duration: '30s',     // run for 30 seconds
// };
// export const options = {
//   scenarios: {
//     stressTest: {
//       executor: "ramping-vus",
//       startVUs: 0,
//       stages: [
//         { duration: "1m", target: 20 }, // ramp up to 20 VUs
//         { duration: "2m", target: 50 }, // moderate load
//         { duration: "2m", target: 100 }, // push peak stress
//         { duration: "2m", target: 150 }, // max stress
//         { duration: "2m", target: 0 }, // ramp down
//       ],
//       gracefulRampDown: "30s",
//     },
//   },
// };
// export const options = {
//   vus: 2,         // run with 2 virtual users
//   iterations: 4,  // total cycles = 4 (2 cycles per VU)
// };
// export const options = {
//   scenarios: {
//     signup_load_test: {
//       executor: "ramping-vus",
//       startVUs: 0,
//       stages: [
//         { duration: "30s", target: 10 },   // ramp up
//         { duration: "1m", target: 10 },    // steady load
//         { duration: "15s", target: 0 },    // ramp down
//       ],
//       gracefulRampDown: "5s",
//     },
//   },
// };
// export const options = {
//   scenarios: {
//     parents: {
//       executor: 'constant-vus',
//       vus: 5,             // 5 Parents
//       duration: '1m',     
//       exec: 'parentFlow', 
//       startTime: '0s',    
//     },
//     sitters: {
//       executor: 'constant-vus',
//       vus: 5,             // 5 Sitters
//       duration: '50s',    
//       exec: 'sitterFlow', 
//       startTime: '10s',   
//     },
//   },
//   thresholds: {
//     'http_req_duration': ['p(95)<2000'], 
//     'errors': ['count<10'],
//   },
// }
export const options = {
  scenarios: {
    // 1. PARENTS: Ramp up to 50 concurrent users
    parents: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },  // Warm up
        { duration: '1m', target: 20 },  // Ramp up
        { duration: '2m', target: 50 },  // 🔴 STRESS PEAK
        { duration: '30s', target: 0 },  // Cool down
      ],
      exec: 'parentFlow',
      startTime: '0s', 
    },
    // 2. SITTERS: Ramp up to 50 concurrent users (Wait 10s to start)
    sitters: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 20 },
        { duration: '2m', target: 50 },  // 🔴 STRESS PEAK
        { duration: '30s', target: 0 },
      ],
      exec: 'sitterFlow',
      startTime: '10s', // Sitters still wait a bit for jobs to accumulate
    },
  },
  thresholds: {
    // We expect the system to be slower under stress (Allow up to 3s)
    'http_req_duration': ['p(95)<3000'], 
    // We want to know if errors spike (allow up to 5% failure rate)
    'http_req_failed': ['rate<0.05'], 
  },
}