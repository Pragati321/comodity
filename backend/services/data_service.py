"""
Data Service — Handles persistence and retrieval of agent outputs.
Bridges agents ↔ database ↔ API routers.
"""
import json
from datetime import datetime
from config import settings
from database import fetch_all, fetch_one, execute, execute_many


# --- Commodity Helpers ---

async def get_all_commodities() -> list[dict]:
    """Get all tracked commodities."""
    return await fetch_all("SELECT * FROM commodities ORDER BY name")


async def get_commodity(slug: str) -> dict | None:
    """Get a single commodity by slug."""
    return await fetch_one("SELECT * FROM commodities WHERE slug = ?", (slug,))


async def add_commodity(slug: str, name: str, unit: str, relevance: str):
    """Add a new commodity."""
    await execute(
        "INSERT INTO commodities (slug, name, unit, relevance) VALUES (?, ?, ?, ?)",
        (slug, name, unit, relevance)
    )


async def update_commodity(slug: str, name: str, unit: str, relevance: str):
    """Update an existing commodity."""
    await execute(
        "UPDATE commodities SET name = ?, unit = ?, relevance = ? WHERE slug = ?",
        (name, unit, relevance, slug)
    )


async def delete_commodity(slug: str):
    """Delete a commodity and all associated data."""
    # Delete related records first to maintain integrity
    await execute("DELETE FROM prices WHERE commodity_slug = ?", (slug,))
    await execute("DELETE FROM analyses WHERE commodity_slug = ?", (slug,))
    await execute("DELETE FROM commodities WHERE slug = ?", (slug,))


# --- Price Helpers ---

async def save_prices(price_data: list[tuple]):
    """Save price records. Each tuple: (commodity_slug, price, source)."""
    await execute_many(
        "INSERT INTO prices (commodity_slug, price, source) VALUES (?, ?, ?)",
        price_data
    )


async def get_latest_price(slug: str) -> dict | None:
    """Get the most recent price for a commodity."""
    return await fetch_one(
        "SELECT * FROM prices WHERE commodity_slug = ? ORDER BY recorded_at DESC LIMIT 1",
        (slug,)
    )


async def get_price_history(slug: str, limit: int = 30) -> list[dict]:
    """Get price history for a commodity (most recent first)."""
    return await fetch_all(
        "SELECT price, recorded_at FROM prices WHERE commodity_slug = ? ORDER BY recorded_at DESC LIMIT ?",
        (slug, limit)
    )


async def get_price_sparkline(slug: str, points: int = 14) -> list[float]:
    """Get a compact sparkline (list of floats) for a commodity."""
    rows = await fetch_all(
        "SELECT price FROM prices WHERE commodity_slug = ? ORDER BY recorded_at DESC LIMIT ?",
        (slug, points)
    )
    return [r["price"] for r in reversed(rows)]


# --- Analysis Helpers ---

async def save_analysis(slug: str, analysis: dict):
    """Save a deep research analysis for a commodity."""
    await execute(
        "INSERT INTO analyses (commodity_slug, analysis_json) VALUES (?, ?)",
        (slug, json.dumps(analysis))
    )


async def get_latest_analysis(slug: str) -> dict | None:
    """Get the most recent analysis for a commodity."""
    row = await fetch_one(
        "SELECT analysis_json, created_at FROM analyses WHERE commodity_slug = ? ORDER BY created_at DESC LIMIT 1",
        (slug,)
    )
    if row:
        return {**json.loads(row["analysis_json"]), "created_at": row["created_at"]}
    return None


# --- Intelligence Feed Helpers ---

async def save_feed_items(items: list[dict]):
    """Save intelligence feed items (upsert/replace)."""
    for item in items:
        await execute(
            """INSERT OR REPLACE INTO intelligence_feed 
               (id, title, summary, classification, source, source_url, related_commodities, published_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                item["id"], item["title"], item["summary"],
                item.get("classification", "normal"),
                item.get("source", ""), item.get("source_url", ""),
                json.dumps(item.get("related_commodities", [])),
                item.get("timestamp", item.get("timestamp", datetime.utcnow().isoformat()))
            )
        )


async def get_feed(limit: int = 40) -> list[dict]:
    """
    Get a diverse intelligence feed.
    Ensures that no single commodity dominates the feed by picking the top N most 
    recent items per material within the configured time window.
    """
    # We use a CTE to rank items per commodity using json_each to flatten the related_commodities array.
    # This ensures a diverse mix of materials in the global feed.
    query = f"""
        WITH ranked_feed AS (
            SELECT 
                f.*,
                ROW_NUMBER() OVER (
                    PARTITION BY j.value 
                    ORDER BY f.published_at DESC
                ) as material_rank
            FROM intelligence_feed f
            LEFT JOIN json_each(f.related_commodities) j
            WHERE f.published_at > datetime('now', '-{settings.INTELLIGENCE_WINDOW_HOURS} hours')
        )
        SELECT * FROM ranked_feed 
        WHERE material_rank <= 3 OR related_commodities = '[]'
        GROUP BY id
        ORDER BY published_at DESC 
        LIMIT ?
    """
    rows = await fetch_all(query, (limit,))
    for r in rows:
        if isinstance(r.get("related_commodities"), str):
            r["related_commodities"] = json.loads(r["related_commodities"])
    return rows


async def get_last_feed_update() -> str:
    """Get the timestamp of the most recent sync (insertion)."""
    row = await fetch_one("SELECT MAX(created_at) as last_ts FROM intelligence_feed")
    if row and row["last_ts"]:
        # SQLite stored it as 'YYYY-MM-DD HH:MM:SS', convert to ISO
        ts = row["last_ts"]
        if "T" not in ts:
            ts = ts.replace(" ", "T")
        if not ts.endswith("Z"):
            ts += "Z"
        return ts
    return "2026-05-01T00:00:00Z"


async def get_related_feed(slug: str, limit: int = 10) -> list[dict]:
    """Get intelligence feed items related to a specific commodity."""
    # We use LIKE since related_commodities is a JSON string array
    query = """
        SELECT * FROM intelligence_feed 
        WHERE related_commodities LIKE ? 
        ORDER BY published_at DESC LIMIT ?
    """
    rows = await fetch_all(query, (f'%"{slug}"%', limit))
    for r in rows:
        if isinstance(r.get("related_commodities"), str):
            r["related_commodities"] = json.loads(r["related_commodities"])
    return rows


# --- Executive Summary Helpers ---

async def save_executive_summary(text: str):
    """Save a new executive summary."""
    await execute(
        "INSERT INTO executive_summaries (summary_text) VALUES (?)",
        (text,)
    )


async def get_latest_summary() -> str:
    """Get the most recent executive summary."""
    row = await fetch_one(
        "SELECT summary_text FROM executive_summaries ORDER BY created_at DESC LIMIT 1"
    )
    return row["summary_text"] if row else "Executive summary is being generated..."
