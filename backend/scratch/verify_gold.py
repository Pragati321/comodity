import sqlite3
import os

db_path = "commodity_intelligence.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM commodities WHERE slug = 'gold'")
    row = cursor.fetchone()
    if row:
        print(f"Found Gold: {row}")
    else:
        print("Gold not found in database")
    conn.close()
else:
    print("Database not found")
