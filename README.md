markdown
# K6 Performance Tests

A comprehensive collection of k6 load testing scripts for various applications and services.

## 📁 Project Structure
k6-tests/
├── vscode/ # VS Code extension tests
├── ExampleRun/ # Example test runs and templates
├── Human-Nature/ # Human Nature application tests
│ ├── CreateQuestions/
│ ├── create-question.js
│ ├── data.js
│ ├── chat.js
│ ├── get-notifications.js
│ ├── guest-signup.js
│ ├── login.js
│ ├── results3.json
│ └── submit-response.js
├── Jawhar.ai/ # Jawhar AI platform tests
│ ├── config/
│ │ └── endpoints.js
│ ├── login.js
│ ├── signUpOTPLogin.js
│ └── summary.html
├── Results/ # Test results and outputs
│ ├── results.json
│ └── results1.json
├── SnapLegal/ # SnapLegal application tests
│ ├── config/
│ ├── Templates/
│ ├── data/
│ ├── failure-log.txt
│ ├── templates.js
│ ├── .env
│ ├── callback.js
│ ├── inquiries.js
│ ├── invite-members.js
│ ├── login.js
│ ├── plans.js
│ ├── select-plans.js
│ ├── SignUpLogin.js
│ └── summary.html
├── SocialSmart/ # SocialSmart AI tests
│ └── socialsmartAI.js
├── utils/ # Utility functions
│ └── RandomEmail.js
├── .gitignore
├── README.md
├── Scenarios.js
└── users.js

text

## 🚀 Quick Start

### Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed

### Installation

```bash
# macOS
brew install k6

# Windows
winget install k6

# Ubuntu/Debian
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
Running Tests
bash
# Run specific test
k6 run SnapLegal/login.js

# Run with custom VUs and duration
k6 run --vus 10 --duration 30s Human-Nature/login.js

# Run with stages configuration
k6 run Jawhar.ai/signUpOTPLogin.js
📊 Test Categories
Authentication & User Management
Login/Logout flows (login.js)

User registration (SignUpLogin.js, guest-signup.js)

OTP verification (signUpOTPLogin.js)

Password reset flows

API Endpoint Testing
CRUD operations (inquiries.js, create-question.js)

Data submission (submit-response.js)

Notification systems (get-notifications.js)

Chat functionality (chat.js)

Business Logic
Plan selection (plans.js, select-plans.js)

Member invitations (invite-members.js)

AI interactions (socialsmartAI.js)

Payment callbacks (callback.js)

⚙️ Configuration
Scenario Configuration
Modify Scenarios.js to adjust test parameters:

javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};
Environment Setup
Some tests require environment variables:

bash
cp SnapLegal/.env.example SnapLegal/.env
# Edit .env with your configuration
📈 Results & Reporting
Generated Reports
HTML Summary: summary.html in each test directory

JSON Results: Detailed metrics in Results/ directory

Console Output: Real-time test execution metrics

Viewing Reports
bash
# Open HTML report in browser
open SnapLegal/summary.html
🛠 Utilities
Random Email Generator
javascript
import { generateRandomEmail } from '../utils/RandomEmail.js';
const userEmail = generateRandomEmail();
🎯 Performance Thresholds
All tests include performance thresholds:

Response Time: p95 < 500ms

Error Rate: < 1%

Business Logic: Custom checks per test case

📝 Test Execution Levels
Level	Virtual Users	Purpose
Smoke	1-5 VUs	Basic functionality verification
Load	50-100 VUs	Average expected traffic
Stress	500+ VUs	System breaking point analysis
Spike	Rapid scaling	Traffic surge handling
🔧 Customization
Adding New Tests
Follow existing file structure

Import shared utilities from utils/

Include HTML report generation

Set appropriate performance thresholds

Modifying Existing Tests
Update endpoints in config/endpoints.js

Adjust test data in data.js

Modify scenarios in Scenarios.js

📚 Documentation
k6 Official Documentation

k6 JavaScript API

k6 Results Output

