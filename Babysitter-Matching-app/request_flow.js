import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { login } from './login.js'; 
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { endpoints } from './config/endpoints.js';
import { options } from '../Scenarios.js';
export { options };


const errorRate = new Counter('errors');

// 🟢 GLOBAL VARIABLES
let parentToken = null;
let sitterToken = null;

// ==========================================
// 👨‍👩‍👧 PARENT FLOW 
// ==========================================
export function parentFlow() {
  // 1. LOGIN
  if (!parentToken) {
    parentToken = login('parent');
    if (!parentToken) { sleep(1); return; }
  }

  const authParams = {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${parentToken}` },
  };

  // 2. CREATE REQUEST
  const payload = JSON.stringify({
    title: "Evening Babysitting",
    startDateTime: "2025-12-18T18:00:00Z",
    endDateTime: "2025-12-18T22:00:00Z",
    location: "DHA Phase 6, Karachi",
    numberOfKids: 2,
    preferredLanguage: "en",
    additionalNotes: "Auto-generated load test"
  });

  let res = http.post(endpoints.CREATE_REQUEST, payload, authParams);

  if (res.status === 401) { parentToken = null; return; }

  if (!check(res, { 'Parent: Job Created': (r) => r.status === 201 })) {
    errorRate.add(1);
    console.log(`Create Failed: ${res.body}`);
    sleep(1);
    return;
  }

  let requestId = res.json('data._id'); 
  let sitterIdToAssign = null;

  // 3. POLLING LOOP
  for (let i = 0; i < 20; i++) {
    sleep(2); 
    
    res = http.get(endpoints.GET_BY_ID(requestId), authParams);
    if (res.status !== 200) continue;

    let jobData = res.json('data'); 
    
    if (jobData && jobData.availableSitters && jobData.availableSitters.length > 0) {
      let firstSitter = jobData.availableSitters[0];
      sitterIdToAssign = firstSitter._id || firstSitter; 
      break; 
    }
  }

  if (!sitterIdToAssign) {
    console.log(`Parent: Timeout - No sitter applied for ${requestId}`);
    errorRate.add(1);
    return;
  }

  // 4. ASSIGN SITTER
  res = http.post(endpoints.ASSIGN_SITTER(requestId, sitterIdToAssign), {}, authParams);
  
  // 🟢 FIX: Accept 200 OR 201
  const assigned = check(res, { 
    'Parent: Sitter Assigned': (r) => r.status === 200 || r.status === 201 
  });

  if (!assigned) {
     console.log(`Assign Failed ${requestId}: ${res.status} ${res.body}`);
  }

  // 5. UPDATE STATUS
  http.patch(endpoints.UPDATE_STATUS(requestId), JSON.stringify({ status: 'assigned' }), authParams);
  sleep(1);
  res = http.patch(endpoints.UPDATE_STATUS(requestId), JSON.stringify({ status: 'completed' }), authParams);
  check(res, { 'Parent: Flow Completed': (r) => r.status === 200 });
}

// ==========================================
// 🦸 SITTER FLOW
// ==========================================
export function sitterFlow() {
  // 1. LOGIN
  if (!sitterToken) {
    sitterToken = login('sitter');
    if (!sitterToken) { sleep(1); return; }
  }

  const authParams = {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sitterToken}` },
  };

  // 2. GET REQUESTS
  let res = http.get(endpoints.GET_REQUESTS, authParams);
  
  if (res.status === 401) { sitterToken = null; return; }
  if (res.status !== 200) { sleep(1); return; }

  let jobs = res.json('data.data'); 
  if (!jobs || jobs.length === 0) { sleep(1); return; }

  // 3. FILTER ACTIVE JOBS
  let activeJobs = jobs.filter(j => j.status === 'active');

  if (activeJobs.length > 0) {
    let randomIndex = Math.floor(Math.random() * activeJobs.length);
    let targetJob = activeJobs[randomIndex];
    let requestId = targetJob._id;
    
    // 4. APPLY
    res = http.post(endpoints.MARK_AVAILABLE(requestId), JSON.stringify({}), authParams);
    
    // Accept 200 or 201
    if (res.status === 200 || res.status === 201) {
       check(res, { 'Sitter: Applied': (r) => true }); 
    } 
    else if (res.status === 400) {
       // Ignore "Already Applied" errors
    } 
    else {
       check(res, { 'Sitter: Applied': (r) => false });
    }
    
    sleep(2);
  } else {
    sleep(2);
  }
}
export function handleSummary(data) {
  return {
    ".summary.html": htmlReport(data),
  };
}