import requests
import json

def test_dashboard():
    url = "http://127.0.0.1:8001/api/dashboard"
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Dashboard data fetched successfully")
            print(f"Number of commodities: {len(data.get('commodities', []))}")
            print(f"Executive Summary length: {len(data.get('executive_summary', ''))}")
        else:
            print(f"Error Response: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_dashboard()
