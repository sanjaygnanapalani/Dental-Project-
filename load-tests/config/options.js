export const loadTestOptions = {
  scenarios: {
    baseline_load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 }, // Ramp-up to 100 VUs
        { duration: '50s', target: 100 }, // Sustain 100 VUs for 50s (total 1 min load)
        { duration: '5s', target: 0 }     // Ramp-down to 0 VUs
      ],
      gracefulRampDown: '5s'
    }
  },
  thresholds: {
    // Failure rate must be less than 1%
    http_req_failed: ['rate<0.01'],
    
    // Response time thresholds for heavy PyTorch model inference under 100 concurrent VUs:
    // avg < 400ms, p95 < 700ms, max < 2000ms
    http_req_duration: [
      'avg<400',
      'p(95)<700',
      'max<2000'
    ],

    // Target request throughput metric
    http_reqs: ['count>1000']
  }
};

export default loadTestOptions;
