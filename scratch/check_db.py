import sqlite3
import os

db_path = r'c:\Users\PragatiArora\Downloads\Deep Research\backend\commodity_intelligence.db'

def check_db():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Correct table names from database.py
    tables = ["commodities", "prices", "analyses", "intelligence_feed", "executive_summaries"]

    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Table '{table}': {count} rows")
        except Exception as e:
            print(f"Table '{table}': Error {e}")

    conn.close()

if __name__ == "__main__":
    check_db()
