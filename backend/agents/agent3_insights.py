"""
Agent 3: CXO Insights & Global Intelligence Agent
Goal: Synthesize data and research into professional, actionable intelligence.
Produces: Global intelligence feed (classified as Risk/Opportunity/Normal) + Executive summary.
"""
import json
import asyncio
import traceback
from services.llm_service import call_llm
from services.data_service import (
    get_all_commodities, save_feed_items, save_executive_summary,
    get_latest_price, get_latest_analysis, get_last_feed_update
)
from config import settings


INSIGHTS_SYSTEM_PROMPT = """You are the Chief Intelligence Officer at a global optical fibre 
manufacturing company. Your role is to synthesize market data and deep research into 
executive-ready intelligence briefings.

Your output must be:
- CLASSIFIED: Every item tagged as Risk (Risk), Opportunity (Opportunity), or Normal (Normal)
- SOURCED: Every claim attributed to a credible source with dates
- CHRONOLOGICAL: Events ordered by recency (most recent first)
- ACTIONABLE: Every insight must imply a strategic response
- CONCISE: CXO-grade writing — no filler, no hedging, direct statements

You write for board-level executives making multi-million dollar procurement decisions."""


async def run_agent3():
    """
    Execute the CXO insights agent.
    Generates the global intelligence feed and executive summary.
    """
    print("\nAgent 3: Generating CXO insights...")
    
    last_update = await get_last_feed_update()
    print(f"  Last update time: {last_update}")

    commodities = await get_all_commodities()
    if not commodities:
        print("Agent 3: No commodities found")
        return

    # Build context from Agent 1 and Agent 2 outputs
    context_parts = []
    for c in commodities:
        slug = c["slug"]
        name = c["name"]

        price = await get_latest_price(slug)
        analysis = await get_latest_analysis(slug)

        part = f"\n### {name} ({slug})"
        if price:
            part += f"\n  Price: {price['price']} {c['unit']}"
        if analysis:
            # Handle structured Supply/Demand
            sd = analysis.get('supply_demand', {})
            sd_summary = sd.get('summary', 'N/A') if isinstance(sd, dict) else analysis.get('supply_demand_analysis', 'N/A')
            part += f"\n  Supply/Demand: {str(sd_summary)[:200]}"
            
            # Handle structured Risk Factors
            risks = analysis.get('risk_factors', [])
            risk_titles = [r.get('title', str(r)) if isinstance(r, dict) else str(r) for r in risks[:2]]
            part += f"\n  Key Risks: {', '.join(risk_titles)}"
            
            # Handle structured Opportunities
            opps = analysis.get('opportunities', [])
            opp_titles = [o.get('title', str(o)) if isinstance(o, dict) else str(o) for o in opps[:2]]
            part += f"\n  Key Opportunities: {', '.join(opp_titles)}"

        context_parts.append(part)

    context = "\n".join(context_parts)

    # --- Generate Intelligence Feed ---
    # Use a template string to avoid f-string escaping issues with JSON
    json_template = """
{
  "intelligence_feed": [
    {
      "id": "news_[slug]_[timestamp_compact]",
      "timestamp": "ISO 8601 timestamp",
      "title": "Concise headline (max 12 words)",
      "summary": "2-3 sentence analysis of impact on optical fibre manufacturing",
      "classification": "risk" | "opportunity" | "normal",
      "source": "Full source name",
      "source_url": "Full URL",
      "related_commodities": ["slug-1", "slug-2"]
    }
  ]
}
"""
    feed_prompt = f"""Use Google Search to find the 10-15 most RECENT (specifically since {last_update}) 
global events, policy shifts, and market developments affecting the following commodities 
in the optical fibre supply chain.

MARKET CONTEXT:
{context}

Return a JSON object with key "intelligence_feed" containing an array of items, each with:

{json_template}

You MUST find REAL news. Do not make up events. 
Focus heavily on developments that have occurred SINCE {last_update}.
If you cannot find new events since that exact time, provide the most recent significant events from the last 72 hours.
Generate unique, descriptive IDs for each event (e.g., news_copper_20260502_01).
Order items chronologically (most recent first).
"""

    try:
        feed_response = await call_llm(feed_prompt, system_instruction=INSIGHTS_SYSTEM_PROMPT, use_search=True)
        await asyncio.sleep(settings.AGENT_SLEEP_SECONDS)
        feed_data = json.loads(feed_response)
        # Robust parsing for different possible keys
        feed_items = feed_data.get("intelligence_feed") or feed_data.get("global_events") or feed_data.get("data", {}).get("global_events") or []

        if feed_items:
            await save_feed_items(feed_items)
            print(f"  Saved {len(feed_items)} intelligence feed items")

    except Exception as e:
        print(f"  Feed generation error: {e}")
        traceback.print_exc()
        feed_items = []

    # --- Generate Executive Summary ---
    summary_prompt = f"""Based on the following commodity market intelligence for an optical fibre manufacturer,
write a concise executive summary (4-6 sentences) suitable for a board briefing.

MARKET CONTEXT:
{context}

The summary should:
1. Lead with the single most important development
2. Quantify the overall cost impact (estimate QoQ change in procurement cost index)
3. Highlight the top 2 risks and top 1 opportunity
4. End with a clear strategic recommendation

Return a JSON object: {{"executive_summary": "Your summary text here"}}
"""

    try:
        summary_response = await call_llm(summary_prompt, system_instruction=INSIGHTS_SYSTEM_PROMPT)
        await asyncio.sleep(settings.AGENT_SLEEP_SECONDS)
        summary_data = json.loads(summary_response)
        summary_text = summary_data.get("executive_summary") or summary_data.get("summary") or ""

        if summary_text:
            await save_executive_summary(summary_text)
            print(f"  Executive summary generated")

    except Exception as e:
        print(f"  Summary generation error: {e}")
        traceback.print_exc()
        summary_text = ""

    print("Agent 3: CXO insights generation complete")
    return {"feed_count": len(feed_items), "has_summary": bool(summary_text)}
