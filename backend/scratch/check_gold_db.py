import sqlite3
import json

conn = sqlite3.connect('commodity_intelligence.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM intelligence_analysis WHERE commodity_slug="gold" ORDER BY created_at DESC LIMIT 1')
row = cursor.fetchone()
if row:
    print(f"Found analysis for gold: {row[0]}")
    # row[2] is likely the JSON analysis
    # Let's check the schema first
    cursor.execute('PRAGMA table_info(intelligence_analysis)')
    print(cursor.fetchall())
else:
    print("No analysis found for gold")
conn.close()
