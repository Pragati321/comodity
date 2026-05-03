
import sqlite3
import json

def check_urls():
    try:
        conn = sqlite3.connect('commodity_intelligence.db')
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT title, source, source_url FROM intelligence_feed LIMIT 20")
        rows = cursor.fetchall()
        for row in rows:
            print(f"Source: {row['source']}")
            print(f"Title: {row['title']}")
            print(f"URL: {row['source_url']}")
            print("-" * 50)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_urls()
