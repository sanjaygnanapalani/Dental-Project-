import http from 'k6/http';
import { check } from 'k6';

const API_BASE_URL = __ENV.API_URL || 'http://localhost:5000';
const COMMON_HEADERS = {
  'Connection': 'keep-alive',
  'Accept': 'application/json'
};

export function testHealthEndpoint() {
  const res = http.get(`${API_BASE_URL}/api/health`, {
    headers: COMMON_HEADERS,
    tags: { name: 'GET_Health' }
  });

  check(res, {
    'Health status is 200': (r) => r.status === 200,
    'Status online': (r) => {
      try {
        return r.status === 200 && r.json() && r.json().status === 'online';
      } catch {
        return false;
      }
    }
  });

  return res;
}

export function testStatusEndpoint() {
  const res = http.get(`${API_BASE_URL}/api/status`, {
    headers: COMMON_HEADERS,
    tags: { name: 'GET_Status' }
  });

  check(res, {
    'Status endpoint is 200': (r) => r.status === 200
  });

  return res;
}

export function testModelInfoEndpoint() {
  const res = http.get(`${API_BASE_URL}/api/model-info`, {
    headers: COMMON_HEADERS,
    tags: { name: 'GET_ModelInfo' }
  });

  check(res, {
    'Model-info status is 200': (r) => r.status === 200,
    'Model loaded active': (r) => {
      try {
        return r.status === 200 && r.json() && r.json().engine !== undefined;
      } catch {
        return false;
      }
    }
  });

  return res;
}

export function testAnalyzeEndpoint(payload) {
  const params = {
    headers: {
      ...COMMON_HEADERS,
      'Content-Type': 'application/json'
    },
    tags: { name: 'POST_Analyze' }
  };

  const res = http.post(`${API_BASE_URL}/api/analyze`, JSON.stringify(payload), params);

  check(res, {
    'Analyze status is 200': (r) => r.status === 200,
    'Analyze returns success': (r) => {
      try {
        return r.status === 200 && r.json() && r.json().success === true;
      } catch {
        return false;
      }
    }
  });

  return res;
}
