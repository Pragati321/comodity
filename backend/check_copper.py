import sqlite3
import json

conn = sqlite3.connect('commodity_intelligence.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute("SELECT * FROM analyses WHERE commodity_slug = 'copper'")
rows = cur.fetchall()
print(f"Count: {len(rows)}")
if rows:
    last = rows[-1]
    print(f"Created At: {last['created_at']}")
    data = json.loads(last['analysis_json'])
    print(json.dumps(data, indent=2))
