import { sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { loadTestOptions } from '../config/options.js';
import { 
  testHealthEndpoint, 
  testStatusEndpoint,
  testModelInfoEndpoint, 
  testAnalyzeEndpoint
} from './apiScenarios.js';

export const options = {
  ...loadTestOptions,
  noConnectionReuse: false
};

// Custom Metrics for Requests Per Second (RPS) and Latencies
export const customRpsTrend = new Trend('custom_rps_metric');
export const totalRequestCounter = new Counter('custom_total_requests');

const samplePayload = JSON.parse(open('../data/samplePayload.json'));

export default function () {
  // Scenario 1: Health Check Endpoint
  testHealthEndpoint();
  totalRequestCounter.add(1);

  // Scenario 2: Status Check Endpoint
  testStatusEndpoint();
  totalRequestCounter.add(1);

  // Scenario 3: Model Info Endpoint
  testModelInfoEndpoint();
  totalRequestCounter.add(1);

  // Scenario 4: Image Analysis Inference Endpoint
  testAnalyzeEndpoint(samplePayload);
  totalRequestCounter.add(1);

  // Pacing think time (1.8s) for Windows ephemeral TCP port recycling under 100 VUs
  sleep(1.8);
}

export function handleSummary(data) {
  const httpReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const durationSec = data.metrics.http_reqs ? (data.metrics.http_reqs.values.rate > 0 ? (httpReqs / data.metrics.http_reqs.values.rate) : 60) : 60;
  const rps = (httpReqs / durationSec).toFixed(2);

  const avgDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 0;
  const p95Duration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 0;
  const maxDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values.max.toFixed(2) : 0;
  const minDuration = data.metrics.http_req_duration ? data.metrics.http_req_duration.values.min.toFixed(2) : 0;
  const failRate = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 0;

  const summaryText = `
================================================================================
                    GRAFANA k6 BASELINE / LOAD TEST SUMMARY                     
================================================================================
  Target Virtual Users (VUs) : 100 VUs
  Test Execution Duration     : 1 Minute (60 Seconds)
  Total Requests Handled     : ${httpReqs}
  Requests Per Second (RPS)  : ${rps} req/sec
--------------------------------------------------------------------------------
  RESPONSE TIME METRICS (SLAs):
    - Minimum Latency (min)  : ${minDuration} ms
    - Average Latency (avg)  : ${avgDuration} ms  (Target: < 400 ms)
    - 95th Percentile (p95)  : ${p95Duration} ms  (Target: < 700 ms)
    - Maximum Latency (max)  : ${maxDuration} ms  (Target: < 2000 ms)
--------------------------------------------------------------------------------
  HTTP FAILURE RATE           : ${failRate}%       (Target: < 1.00%)
================================================================================
`;

  return {
    'stdout': summaryText,
    'load-tests/reports/load_test_summary.json': JSON.stringify(data, null, 2),
    'load-tests/reports/load_test_report.html': generateHtmlReport(data, rps, avgDuration, p95Duration, maxDuration, minDuration, failRate, httpReqs)
  };
}

function generateHtmlReport(data, rps, avg, p95, max, min, failRate, totalReqs) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Grafana k6 Load Test Report</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 30px; }
    .container { max-width: 1000px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h1 { color: #38bdf8; margin-top: 0; border-bottom: 2px solid #334155; padding-bottom: 12px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
    .card { background: #0f172a; padding: 20px; border-radius: 12px; border: 1px solid #334155; text-align: center; }
    .card-title { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
    .card-value { font-size: 1.8rem; font-weight: 800; color: #38bdf8; margin-top: 8px; }
    .status-pass { color: #4ade80; font-weight: bold; }
    .status-fail { color: #f87171; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 14px; text-align: left; border-bottom: 1px solid #334155; }
    th { background: #0f172a; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Grafana k6 Baseline Load Test Report</h1>
    <p>100 Concurrent Virtual Users running continuously for 1 minute.</p>
    
    <div class="grid">
      <div class="card">
        <div class="card-title">Throughput (RPS)</div>
        <div class="card-value">${rps} req/s</div>
      </div>
      <div class="card">
        <div class="card-title">Total Requests</div>
        <div class="card-value">${totalReqs}</div>
      </div>
      <div class="card">
        <div class="card-title">Avg Latency</div>
        <div class="card-value">${avg} ms</div>
      </div>
      <div class="card">
        <div class="card-title">p(95) Latency</div>
        <div class="card-value">${p95} ms</div>
      </div>
    </div>

    <h2>Latency Breakdown & Metric Metrics</h2>
    <table>
      <thead>
        <tr><th>Metric Name</th><th>Target SLA</th><th>Measured Value</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td>Requests Per Second (RPS)</td><td>Continuous throughput</td><td>${rps} req/sec</td><td><span class="status-pass">PASS</span></td></tr>
        <tr><td>Average Response Time (avg)</td><td>&lt; 400 ms</td><td>${avg} ms</td><td><span class="${parseFloat(avg) < 400 ? 'status-pass' : 'status-fail'}">${parseFloat(avg) < 400 ? 'PASS' : 'WARN'}</span></td></tr>
        <tr><td>95th Percentile (p95)</td><td>&lt; 700 ms</td><td>${p95} ms</td><td><span class="${parseFloat(p95) < 700 ? 'status-pass' : 'status-fail'}">${parseFloat(p95) < 700 ? 'PASS' : 'WARN'}</span></td></tr>
        <tr><td>Maximum Response Time (max)</td><td>&lt; 2000 ms</td><td>${max} ms</td><td><span class="${parseFloat(max) < 2000 ? 'status-pass' : 'status-fail'}">${parseFloat(max) < 2000 ? 'PASS' : 'WARN'}</span></td></tr>
        <tr><td>HTTP Failure Rate (http_req_failed)</td><td>&lt; 1.00%</td><td>${failRate}%</td><td><span class="${parseFloat(failRate) < 1.00 ? 'status-pass' : 'status-fail'}">${parseFloat(failRate) < 1.00 ? 'PASS' : 'FAIL'}</span></td></tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
}
