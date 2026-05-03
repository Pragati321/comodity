import sqlite3
import os

db_path = "commodity_intelligence.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM intelligence_feed;")
    count = cursor.fetchone()[0]
    print(f"Total intelligence feed items: {count}")
    
    cursor.execute("SELECT id, title, created_at FROM intelligence_feed ORDER BY created_at DESC LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Title: {row[1]}, Created At: {row[2]}")

    conn.close()
else:
    print("Database not found")
