import sqlite3
import random
from datetime import datetime, timedelta

def seed_history():
    conn = sqlite3.connect('commodity_intelligence.db')
    cursor = conn.cursor()
    
    # Get all commodities
    cursor.execute("SELECT slug FROM commodities")
    slugs = [row[0] for row in cursor.fetchall()]
    
    base_prices = {
        "silicon-dioxide": 280, "germanium-dioxide": 1850, "helium": 4.5,
        "uv-acrylate": 12.5, "crude-oil": 78, "natural-gas": 3.2,
        "aluminum": 2450, "steel": 620, "copper": 9200, "polyethylene": 1350,
    }
    
    # Generate 30 days of history for each
    records = []
    end_date = datetime.utcnow()
    
    for slug in slugs:
        base = base_prices.get(slug, 1000)
        for i in range(30):
            date = (end_date - timedelta(days=i)).strftime('%Y-%m-%d %H:%M:%S')
            variation = random.uniform(-0.1, 0.1)
            price = round(base * (1 + variation), 2)
            records.append((slug, price, "Historical Seed", date))
            
    cursor.executemany(
        "INSERT INTO prices (commodity_slug, price, source, recorded_at) VALUES (?, ?, ?, ?)",
        records
    )
    
    conn.commit()
    conn.close()
    print(f"Seeded 30 days of history for {len(slugs)} commodities.")

if __name__ == "__main__":
    seed_history()
