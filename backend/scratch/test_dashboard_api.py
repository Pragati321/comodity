import requests
import json

try:
    print("Testing /api/dashboard...")
    r = requests.get("http://127.0.0.1:8001/api/dashboard")
    print(f"Status Code: {r.status_code}")
    if r.status_code == 200:
        print("Success!")
        data = r.json()
        commodities = data.get("commodities", [])
        print(f"Found {len(commodities)} commodities.")
        for c in commodities[:3]:
            print(f"- {c['slug']}: {c['current_price']} {c['price_unit']} (Health: {c.get('health_index')})")
    else:
        print(f"Error Response: {r.text}")
except Exception as e:
    print(f"Request failed: {e}")
