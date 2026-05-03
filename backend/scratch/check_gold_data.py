import sqlite3
import json

def check_gold():
    conn = sqlite3.connect('commodity_intelligence.db')
    conn.row_factory = sqlite3.Row
    row = conn.execute('SELECT * FROM analyses WHERE commodity_slug = "gold" ORDER BY created_at DESC LIMIT 1').fetchone()
    if row:
        analysis = json.loads(row['analysis_json'])
        print(json.dumps(analysis, indent=2))
    else:
        print("No gold analysis found")
    conn.close()

if __name__ == "__main__":
    check_gold()
