import sqlite3

def find_gold_analysis():
    conn = sqlite3.connect('commodity_intelligence.db')
    cursor = conn.cursor()
    cursor.execute("SELECT commodity_slug, id FROM analyses WHERE commodity_slug LIKE '%gold%'")
    rows = cursor.fetchall()
    print("Found slugs in analyses:")
    for row in rows:
        print(row)
    conn.close()

if __name__ == "__main__":
    find_gold_analysis()
