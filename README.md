Here's a comprehensive `README.md` for your k6-tests project:

```markdown
# K6 Performance Tests

A collection of k6 performance test scripts for various applications and services.

## 📁 Project Structure

```
k6-tests/
├── vscode/                 # VS Code extension tests
├── ExampleRun/             # Example test runs and templates
├── Human-Nature/           # Human Nature application tests
│   ├── CreateQuestions/
│   ├── create-question.js
│   ├── chat.js
│   ├── login.js
│   └── submit-response.js
├── Jawhar.ai/              # Jawhar AI platform tests
│   ├── config/
│   ├── login.js
│   └── signUpOTPLogin.js
├── Results/                # Test results and outputs
│   ├── results.json
│   └── results1.json
├── SnapLegal/              # SnapLegal application tests
│   ├── config/
│   ├── Templates/
│   ├── data/
│   ├── login.js
│   ├── SignUpLogin.js
│   └── inquiries.js
├── SocialSmart/            # SocialSmart AI tests
│   └── socialsmartAI.js
└── utils/                  # Utility functions
    └── RandomEmail.js
```

## 🚀 Getting Started

### Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed on your system
- Node.js (for some utility scripts)

### Installation

1. Clone this repository
2. Install k6:
   ```bash
   # macOS
   brew install k6
   
   # Windows
   winget install k6
   
   # Linux
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

## 🧪 Running Tests

### Basic Test Execution

```bash
# Run a specific test
k6 run Human-Nature/login.js

# Run with different number of virtual users
k6 run --vus 10 --duration 30s Human-Nature/login.js

# Run with stages (ramp up/down)
k6 run SocialSmart/socialsmartAI.js
```

### Test Scenarios

Each test scenario is configured in `Scenarios.js` and can be customized per application.

## 📊 Test Results

Test results are generated in multiple formats:

- **HTML Reports**: `summary.html` files in each directory
- **JSON Results**: Detailed results in `Results/` directory
- **Console Output**: Real-time metrics during test execution

### Viewing Reports

After running a test, open the generated `summary.html` file in your browser:

```bash
# Example: After running Jawhar.ai tests
open Jawhar.ai/summary.html
```

## 🔧 Configuration

### Environment Variables

Some tests require environment variables. Copy and modify the `.env` file in the respective directory:

```bash
cp SnapLegal/.env.example SnapLegal/.env
```

### Customizing Tests

Modify the test parameters in `Scenarios.js`:

```javascript
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // ramp up to 100 users
    { duration: '5m', target: 100 }, // stay at 100 users
    { duration: '2m', target: 0 },   // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% failures
  },
};
```

## 📋 Available Tests

### Authentication Tests
- **Login/Logout flows**
- **User registration**
- **Password reset**
- **OTP verification**

### API Endpoint Tests
- **CRUD operations**
- **Data submission**
- **File uploads**
- **WebSocket connections**

### Load Testing Scenarios
- **Smoke tests** (1-5 VUs)
- **Average load** (50-100 VUs) 
- **Stress tests** (500+ VUs)
- **Spike tests** (rapid scaling)

## 🛠 Utilities

### Random Email Generator
Used for creating unique test users:

```javascript
import { generateRandomEmail } from '../utils/RandomEmail.js';

const userEmail = generateRandomEmail();
```

## 📈 Monitoring

### Key Metrics Tracked
- **Response times** (p95, p99)
- **Request rate**
- **Error rate**
- **Throughput**
- **Virtual users**

### Thresholds
Tests include performance thresholds that will fail the test if not met:
- HTTP request duration < 500ms (p95)
- Error rate < 1%
- Specific business logic checks

## 🤝 Contributing

1. Follow the existing file structure
2. Add appropriate thresholds for new tests
3. Include HTML report generation
4. Update this README with new test information

## 📝 Notes

- Tests are organized by application/service
- Each directory contains independent test suites
- Shared utilities are in the `utils/` directory
- Results are stored separately from test scripts

## 🔗 Useful Links

- [k6 Documentation](https://k6.io/docs/)
- [k6 JavaScript API](https://k6.io/docs/javascript-api/)
- [k6 Results Output](https://k6.io/docs/results-output/)
```

This README provides:
- Clear project structure overview
- Setup instructions
- Usage examples
- Test categorization
- Contribution guidelines
- Links to documentation

You can place this `README.md` file in the root of your `k6-tests` directory.