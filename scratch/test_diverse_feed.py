
import asyncio
import sqlite3
import json
import os

DB_PATH = "c:\\Users\\PragatiArora\\Downloads\\Deep Research\\backend\\commodity_intelligence.db"

async def test_diverse_feed():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Check current distribution
    print("Current top 20 distribution (No Diversity Logic):")
    cursor.execute("""
        SELECT related_commodities FROM intelligence_feed 
        WHERE published_at > datetime('now', '-24 hours')
        ORDER BY published_at DESC LIMIT 20
    """)
    rows = cursor.fetchall()
    stats = {}
    for r in rows:
        commodities = json.loads(r['related_commodities'])
        if not commodities:
            stats['generic'] = stats.get('generic', 0) + 1
        for c in commodities:
            stats[c] = stats.get(c, 0) + 1
    print(json.dumps(stats, indent=2))

    # New Diversity Logic
    print("\nProposed Diverse Feed (Up to 2 per commodity):")
    query = """
    WITH ranked_items AS (
        SELECT 
            f.*,
            ROW_NUMBER() OVER (
                PARTITION BY j.value 
                ORDER BY f.published_at DESC
            ) as commodity_rank
        FROM intelligence_feed f
        LEFT JOIN json_each(f.related_commodities) j
        WHERE f.published_at > datetime('now', '-24 hours')
    )
    SELECT id, title, related_commodities, published_at, commodity_rank
    FROM ranked_items
    WHERE (commodity_rank <= 2) OR (related_commodities = '[]' AND commodity_rank <= 5)
    GROUP BY id
    ORDER BY published_at DESC
    LIMIT 20
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    stats_diverse = {}
    for r in rows:
        # print(f"Rank {r['commodity_rank']}: {r['title'][:50]}... [{r['related_commodities']}]")
        commodities = json.loads(r['related_commodities'])
        if not commodities:
            stats_diverse['generic'] = stats_diverse.get('generic', 0) + 1
        for c in commodities:
            stats_diverse[c] = stats_diverse.get(c, 0) + 1
    print(json.dumps(stats_diverse, indent=2))
    
    conn.close()

if __name__ == "__main__":
    asyncio.run(test_diverse_feed())
