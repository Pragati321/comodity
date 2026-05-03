import sqlite3
import os

db_path = "commodity_intelligence.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("--- LATEST ANALYSES ---")
    cursor.execute("SELECT commodity_slug, created_at FROM analyses ORDER BY created_at DESC LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Slug: {row[0]}, Created At: {row[1]}")
    
    print("\n--- LATEST INTELLIGENCE FEED ---")
    cursor.execute("SELECT title, created_at FROM intelligence_feed ORDER BY created_at DESC LIMIT 5;")
    rows = cursor.fetchall()
    for row in rows:
        print(f"Title: {row[0]}, Created At: {row[1]}")

    print("\n--- LATEST EXECUTIVE SUMMARY ---")
    cursor.execute("SELECT created_at FROM executive_summaries ORDER BY created_at DESC LIMIT 1;")
    row = cursor.fetchone()
    if row:
        print(f"Created At: {row[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM analyses WHERE created_at > datetime('now', '-5 minutes');")
    count = cursor.fetchone()[0]
    print(f"\nAnalyses created in the last 5 minutes: {count}")
    
    conn.close()
else:
    print("Database not found")
