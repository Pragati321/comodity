import sqlite3
conn = sqlite3.connect('commodity_intelligence.db')
items = conn.execute("SELECT recorded_at FROM prices WHERE commodity_slug='copper' ORDER BY recorded_at DESC LIMIT 5").fetchall()
for r in items:
    print(f"'{r[0]}'")
conn.close()
