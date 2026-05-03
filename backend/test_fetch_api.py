import requests
import json

try:
    r = requests.get("http://127.0.0.1:8001/api/commodity/copper")
    data = r.json()
    print("Historical Count:", len(data.get("historical_prices", [])))
    print("Forecast Count:", len(data.get("forecast_prices", [])))
    if data.get("forecast_prices"):
        print("First Forecast:", data["forecast_prices"][0])
except Exception as e:
    print("Error:", e)
