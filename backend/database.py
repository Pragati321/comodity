"""
SQLite database initialization, seeding, and helpers.
Uses aiosqlite for async operations.
"""
import aiosqlite
import json
from config import settings

DB_PATH = settings.DATABASE_PATH

# 10 commodities for optical fibre manufacturing
SEED_COMMODITIES = [
    ("silicon-dioxide", "Silicon Dioxide (Silica)", "USD/ton", "Core preform material — the primary raw material for optical fibre glass"),
    ("germanium-dioxide", "Germanium Dioxide", "USD/kg", "Dopant used to raise the refractive index of the fibre core"),
    ("helium", "Helium", "USD/mcf", "Essential cooling gas used in the fibre draw tower process"),
    ("uv-acrylate", "UV Acrylate Coating", "USD/kg", "Protective coating applied to bare fibre during drawing"),
    ("crude-oil", "Crude Oil (Brent)", "USD/barrel", "Upstream feedstock for acrylate resins and energy costs"),
    ("natural-gas", "Natural Gas", "USD/MMBtu", "Primary energy input for preform furnaces and draw towers"),
    ("aluminum", "Aluminum", "USD/ton", "Cable armoring, structural elements, and loose tube components"),
    ("steel", "Steel (HRC)", "USD/ton", "Cable armoring, duct infrastructure, and central strength members"),
    ("copper", "Copper", "USD/ton", "Hybrid fibre-copper cable configurations and grounding"),
    ("polyethylene", "Polyethylene (HDPE)", "USD/ton", "Cable sheathing, microduct, and blown fibre conduit material"),
]


async def init_db():
    """Initialize database schema and seed commodity data."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("PRAGMA journal_mode=WAL")
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS commodities (
                slug TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                unit TEXT DEFAULT 'USD/ton',
                relevance TEXT
            );

            CREATE TABLE IF NOT EXISTS prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                commodity_slug TEXT REFERENCES commodities(slug),
                price REAL NOT NULL,
                source TEXT DEFAULT '',
                recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                commodity_slug TEXT REFERENCES commodities(slug),
                analysis_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS intelligence_feed (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                summary TEXT NOT NULL,
                classification TEXT CHECK(classification IN ('risk', 'opportunity', 'normal')) DEFAULT 'normal',
                source TEXT DEFAULT '',
                source_url TEXT DEFAULT '',
                related_commodities TEXT DEFAULT '[]',
                published_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS executive_summaries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                summary_text TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_prices_slug ON prices(commodity_slug);
            CREATE INDEX IF NOT EXISTS idx_prices_date ON prices(recorded_at);
            CREATE INDEX IF NOT EXISTS idx_analyses_slug ON analyses(commodity_slug);
            CREATE INDEX IF NOT EXISTS idx_feed_published ON intelligence_feed(published_at);
        """)

        # Seed commodities if table is empty
        cursor = await db.execute("SELECT COUNT(*) FROM commodities")
        count = (await cursor.fetchone())[0]
        if count == 0:
            await db.executemany(
                "INSERT INTO commodities (slug, name, unit, relevance) VALUES (?, ?, ?, ?)",
                SEED_COMMODITIES
            )
            await db.commit()
            print(f"Seeded {len(SEED_COMMODITIES)} commodities")

        await db.commit()
        print("Database initialized")


async def get_db():
    """Get an async database connection."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def fetch_all(query: str, params: tuple = ()) -> list[dict]:
    """Fetch all rows as list of dicts."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]


async def fetch_one(query: str, params: tuple = ()) -> dict | None:
    """Fetch a single row as dict."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(query, params)
        row = await cursor.fetchone()
        return dict(row) if row else None


async def execute(query: str, params: tuple = ()):
    """Execute a write query."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(query, params)
        await db.commit()


async def execute_many(query: str, params_list: list[tuple]):
    """Execute a write query with multiple parameter sets."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executemany(query, params_list)
        await db.commit()
