# Grafana k6 Baseline & Load Testing Framework

An enterprise-grade performance testing suite built with **Grafana k6** to evaluate API and application behavior under a sustained workload of **100 concurrent Virtual Users (VUs)** for **1 minute**.

---

## 🎯 Test Profile & SLA Objectives

- **Concurrent Virtual Users (VUs)**: 100 VUs
- **Duration**: 1 Minute (60 seconds)
- **Workload Pattern**: 10s Ramp-up $\rightarrow$ 50s Steady State at 100 VUs $\rightarrow$ 5s Ramp-down.
- **Total Requests**: Thousands of requests executed across backend APIs and frontend routes.

### SLA Threshold Targets
| Metric Name | Threshold Target | Description |
| :--- | :--- | :--- |
| **Requests Per Second (RPS)** | Dynamic ($> 100$ req/s) | Measures continuous server request processing capacity per second |
| **Average Latency (`avg`)** | $< 250\text{ ms}$ | Average response time across all 100 concurrent users |
| **95th Percentile (`p95`)** | $< 500\text{ ms}$ | 95% of all request response times must complete faster than 500ms |
| **Maximum Latency (`max`)** | $< 1500\text{ ms}$ ($1.5\text{s}$) | Upper limit ceiling for the slowest response time under load |
| **HTTP Failure Rate (`http_req_failed`)** | $< 1.00\%$ | Error rate across all requests under load |

---

## 📁 Directory Structure

```
load-tests/
├── config/
│   └── options.js               # SLA thresholds, VU stages, and runner options
├── scenarios/
│   ├── baselineLoadTest.js      # Main 100 VU load test script & report generator
│   └── apiScenarios.js          # API endpoint helpers (/api/health, /api/model-info, /api/analyze)
├── data/
│   └── samplePayload.json       # Base64 image payload for inference API testing
├── reports/
│   ├── load_test_report.html    # Interactive visual HTML load test report
│   └── load_test_summary.json   # Machine-readable JSON summary metrics
└── README.md                    # Usage documentation & metric reference
```

---

## 🚀 Execution Instructions

### Prerequisites
- Grafana k6 installed (`winget install GrafanaLabs.k6` or `brew install k6`).
- Target backend server (`python app.py`) or frontend server (`npm run dev` / `npm run preview`) running.

### 1. Run Baseline Load Test via npm
```bash
npm run test:load
```

### 2. Run Baseline Load Test via k6 CLI directly
```bash
k6 run load-tests/scenarios/baselineLoadTest.js
```

### 3. Override Target Endpoints dynamically
```bash
# Run against custom API host
API_URL=http://localhost:5000 TARGET_URL=http://localhost:5173 k6 run load-tests/scenarios/baselineLoadTest.js
```

---

## 📊 Understanding Metrics & Output

When execution completes, k6 prints summary metrics and generates `load-tests/reports/load_test_report.html`:

```text
================================================================================
                    GRAFANA k6 BASELINE / LOAD TEST SUMMARY                     
================================================================================
  Target Virtual Users (VUs) : 100 VUs
  Test Execution Duration     : 1 Minute (60 Seconds)
  Total Requests Handled     : 4250
  Requests Per Second (RPS)  : 141.67 req/sec
--------------------------------------------------------------------------------
  RESPONSE TIME METRICS (SLAs):
    - Minimum Latency (min)  : 12.40 ms
    - Average Latency (avg)  : 62.50 ms  (Target: < 250 ms)
    - 95th Percentile (p95)  : 263.10 ms (Target: < 500 ms)
    - Maximum Latency (max)  : 601.20 ms (Target: < 1500 ms)
--------------------------------------------------------------------------------
  HTTP FAILURE RATE           : 0.00%       (Target: < 1.00%)
================================================================================
```
