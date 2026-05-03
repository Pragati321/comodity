import sqlite3
import json
import os

db_path = r'c:\Users\PragatiArora\Downloads\Deep Research\backend\commodity_intelligence.db'

def inspect_analysis(slug):
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"--- Latest Analysis for {slug} ---")
    cursor.execute("SELECT analysis_json FROM analyses WHERE commodity_slug=? ORDER BY id DESC LIMIT 1", (slug,))
    row = cursor.fetchone()
    if row:
        try:
            data = json.loads(row[0])
            print(json.dumps(data, indent=2))
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            print(f"Raw data: {row[0][:200]}...")
    else:
        print("No analysis found for this slug.")

    conn.close()

if __name__ == "__main__":
    # Test with copper
    inspect_analysis('copper')
