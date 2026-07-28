import time
import json
import base64
import requests
import concurrent.futures
import numpy as np
import pandas as pd
from PIL import Image
import io

BASE_URL = "http://127.0.0.1:5000"
NUM_USERS = 100
DURATION_SECONDS = 60

# Create dummy sample image for /api/analyze payload
img = Image.new("RGB", (200, 200), color=(180, 40, 50))
buf = io.BytesIO()
img.save(buf, format="PNG")
b64_img = "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

results = []

def worker_task(user_id, stop_time):
    session = requests.Session()
    while time.time() < stop_time:
        # 1. Health check endpoint (GET)
        start = time.time()
        try:
            r = session.get(f"{BASE_URL}/api/health", timeout=5)
            latency_ms = (time.time() - start) * 1000
            results.append({
                "user_id": user_id,
                "endpoint": "/api/health",
                "method": "GET",
                "status_code": r.status_code,
                "latency_ms": latency_ms,
                "success": r.status_code == 200,
                "timestamp": time.time()
            })
        except Exception as e:
            latency_ms = (time.time() - start) * 1000
            results.append({
                "user_id": user_id,
                "endpoint": "/api/health",
                "method": "GET",
                "status_code": 0,
                "latency_ms": latency_ms,
                "success": False,
                "timestamp": time.time()
            })

        # 2. Analyze endpoint (POST)
        start = time.time()
        try:
            r = session.post(
                f"{BASE_URL}/api/analyze",
                json={"image": b64_img, "sensitivity": 120},
                timeout=10
            )
            latency_ms = (time.time() - start) * 1000
            results.append({
                "user_id": user_id,
                "endpoint": "/api/analyze",
                "method": "POST",
                "status_code": r.status_code,
                "latency_ms": latency_ms,
                "success": r.status_code == 200,
                "timestamp": time.time()
            })
        except Exception as e:
            latency_ms = (time.time() - start) * 1000
            results.append({
                "user_id": user_id,
                "endpoint": "/api/analyze",
                "method": "POST",
                "status_code": 0,
                "latency_ms": latency_ms,
                "success": False,
                "timestamp": time.time()
            })

        time.sleep(0.05) # simulate user think time

def run_load_test():
    print(f"Starting Baseline/Load Test: {NUM_USERS} Virtual Users for {DURATION_SECONDS} seconds...")
    start_test_time = time.time()
    stop_time = start_test_time + DURATION_SECONDS

    with concurrent.futures.ThreadPoolExecutor(max_workers=NUM_USERS) as executor:
        futures = [executor.submit(worker_task, user_id, stop_time) for user_id in range(NUM_USERS)]
        concurrent.futures.wait(futures)

    total_test_duration = time.time() - start_test_time
    print(f"Test completed in {total_test_duration:.2f} seconds. Total requests sent: {len(results)}")

    df = pd.DataFrame(results)
    
    # Calculate Metrics Summary
    total_reqs = len(df)
    successful_reqs = len(df[df["success"] == True])
    failed_reqs = total_reqs - successful_reqs
    rps = total_reqs / total_test_duration

    avg_lat = df["latency_ms"].mean()
    min_lat = df["latency_ms"].min()
    max_lat = df["latency_ms"].max()
    p50_lat = df["latency_ms"].quantile(0.50)
    p90_lat = df["latency_ms"].quantile(0.90)
    p99_lat = df["latency_ms"].quantile(0.99)

    # Per-Endpoint Breakdown
    ep_summary = []
    for ep, group in df.groupby("endpoint"):
        ep_summary.append({
            "Endpoint": ep,
            "Total Requests": len(group),
            "Success Rate (%)": round((len(group[group["success"] == True]) / len(group)) * 100, 2),
            "RPS": round(len(group) / total_test_duration, 2),
            "Min Latency (ms)": round(group["latency_ms"].min(), 2),
            "Avg Latency (ms)": round(group["latency_ms"].mean(), 2),
            "Max Latency (ms)": round(group["latency_ms"].max(), 2),
            "P95 Latency (ms)": round(group["latency_ms"].quantile(0.95), 2)
        })

    summary_data = {
        "Metric": [
            "Concurrent Virtual Users",
            "Test Duration (seconds)",
            "Total Requests Executed",
            "Successful Requests",
            "Failed Requests",
            "Requests Per Second (RPS)",
            "Min Response Time (ms)",
            "Average Response Time (ms)",
            "Max Response Time (ms)",
            "P50 Latency (ms)",
            "P90 Latency (ms)",
            "P99 Latency (ms)"
        ],
        "Value": [
            NUM_USERS,
            round(total_test_duration, 2),
            total_reqs,
            successful_reqs,
            failed_reqs,
            round(rps, 2),
            round(min_lat, 2),
            round(avg_lat, 2),
            round(max_lat, 2),
            round(p50_lat, 2),
            round(p90_lat, 2),
            round(p99_lat, 2)
        ]
    }

    excel_path = r"c:\Users\sanja\OneDrive\Desktop\PDD App\Load_Test_Results.xlsx"
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        pd.DataFrame(summary_data).to_excel(writer, sheet_name="Overall Summary", index=False)
        pd.DataFrame(ep_summary).to_excel(writer, sheet_name="Endpoint Breakdown", index=False)
        df.to_excel(writer, sheet_name="Raw Response Logs", index=False)

    print(f"Excel results saved successfully to {excel_path}")

if __name__ == "__main__":
    run_load_test()
