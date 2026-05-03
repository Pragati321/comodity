import sqlite3

def check_gold():
    conn = sqlite3.connect('commodity_intelligence.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM commodities WHERE slug = 'gold' OR name LIKE '%Gold%'")
    rows = cursor.fetchall()
    print("Found Commodities:")
    for row in rows:
        print(row)
    
    cursor.execute("SELECT * FROM analyses WHERE commodity_slug = 'gold'")
    analyses = cursor.fetchall()
    print("\nFound Analyses for Gold:")
    for analysis in analyses:
        print(analysis)
    
    cursor.execute("SELECT * FROM prices WHERE commodity_slug = 'gold'")
    prices = cursor.fetchall()
    print("\nFound Prices for Gold:")
    for price in prices:
        print(price)
        
    conn.close()

if __name__ == "__main__":
    check_gold()
