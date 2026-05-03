"""
Agent 1: Data Scraping & Aggregation Agent
Goal: Reliable extraction of quantitative market data for all tracked commodities.
Sources: World Bank, FRED, commodity exchanges (via Gemini web search synthesis).
"""
import json
import asyncio
import traceback
from services.llm_service import call_llm
from services.data_service import get_all_commodities, save_prices
from config import settings


SCRAPER_SYSTEM_PROMPT = """You are a commodity market data analyst specializing in raw materials 
for the optical fibre manufacturing industry. Your job is to provide the LATEST available 
market prices and key data points for commodities.

You must be precise, using real-world market data to the best of your knowledge.
Always include the source of your price data."""


async def run_agent1():
    """
    Execute the data scraping agent.
    Fetches current prices for all tracked commodities.
    """
    print("\nAgent 1: Starting data scraping...")

    commodities = await get_all_commodities()
    if not commodities:
        print("Agent 1: No commodities found in database")
        return

    commodity_list = "\n".join(
        f"- {c['name']} ({c['slug']}), Unit: {c['unit']}, Relevance: {c['relevance']}"
        for c in commodities
    )

    prompt = f"""Search for and provide the CURRENT global market prices for each of the following commodities 
used in optical fibre manufacturing. You MUST use Google Search to find the most recent prices 
from reliable sources like the World Bank, LME, CME, FRED, or USGS.

For each commodity, provide a representative global spot price.

COMMODITIES:
{commodity_list}

Return a JSON object where each key is the commodity slug, and the value is an object with:
- "current_price": number (the current price in the specified unit)
- "change_pct": number (percentage change vs previous period, can be negative)
- "trend": string ("up", "down", or "stable")
- "source": string (precise name of the source where you found this data)

Example format:
{{
  "silicon-dioxide": {{
    "current_price": 285.50,
    "change_pct": -1.2,
    "trend": "down",
    "source": "USGS Mineral Commodity Summaries 2026"
  }}
}}
"""

    try:
        response = await call_llm(prompt, system_instruction=SCRAPER_SYSTEM_PROMPT, use_search=True)
        await asyncio.sleep(settings.AGENT_SLEEP_SECONDS)
        data = json.loads(response)

        price_records = []
        for slug, info in data.items():
            if isinstance(info, dict) and "current_price" in info:
                price_records.append((
                    slug,
                    float(info["current_price"]),
                    info.get("source", "Agent 1 Scraper")
                ))

        if price_records:
            await save_prices(price_records)
            print(f"Agent 1: Saved prices for {len(price_records)} commodities")
        else:
            print("Agent 1: No valid price data extracted")

        return data

    except json.JSONDecodeError as e:
        print(f"Agent 1: Failed to parse LLM response as JSON: {e}")
        traceback.print_exc()
        return None
    except Exception as e:
        print(f"Agent 1: Error: {e}")
        traceback.print_exc()
        return None
