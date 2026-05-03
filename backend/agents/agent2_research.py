"""
Agent 2: Deep Research & Market Analysis Agent
Goal: Qualitative analysis of the market landscape — supply/demand, scenarios,
geographic intelligence, and procurement strategies for each commodity.
"""
import json
import asyncio
import traceback
from services.llm_service import call_llm
from services.data_service import get_all_commodities, save_analysis, get_latest_price
from config import settings


RESEARCH_SYSTEM_PROMPT = """You are a senior commodity market strategist with deep expertise in 
raw materials for the optical fibre and telecommunications infrastructure industry. 

Your analysis must be:
- EXHAUSTIVE: Cover supply chains, demand drivers, cost curves, and capacity pipelines
- GLOBAL: Include intelligence from ALL relevant geographies (China, USA, Europe, India, SE Asia, Middle East, Africa, Latin America)
- ACTIONABLE: Every insight must connect to a procurement or risk management decision

You are writing for a CXO audience at a major optical fibre manufacturer."""


async def run_agent2():
    """
    Execute the deep research agent.
    Generates comprehensive analysis for each tracked commodity.
    """
    print("\nAgent 2: Starting deep research analysis...")

    commodities = await get_all_commodities()
    if not commodities:
        print("Agent 2: No commodities found")
        return

    results = {}

    for commodity in commodities:
        slug = commodity["slug"]
        name = commodity["name"]
        unit = commodity["unit"]
        relevance = commodity["relevance"]

        # Get latest price for context
        latest_price = await get_latest_price(slug)
        price_context = ""
        if latest_price:
            price_context = f"Current market price: {latest_price['price']} {unit} (as of {latest_price['recorded_at']})"

        # Use a template string to avoid f-string escaping issues with JSON
        json_template = """
{
  "supply_demand": {
    "summary": "Extensive, multi-paragraph qualitative analysis (minimum 200 words) of the current supply-demand dynamics, including specific details on production bottlenecks, inventory cycles, and consumption trends across different industries.",
    "market_balance": "Deficit",
    "global_inventory": "Specific data on LME/SHFE stocks (e.g. 120,000 tons, down 15% WoW) with context on historical norms.",
    "production_capacity_utilization": "82%",
    "demand_growth_yoy": "5.4%"
  },
  "geographic_intelligence": {
    "summary": "Deep, comprehensive multi-paragraph qualitative analysis (minimum 300 words) of regional shifts, geopolitical chokepoints, and infrastructure developments. Explain the 'why' behind regional dominance, trade policy impacts like the US CHIPS Act or EU CRM Act, and emerging production hubs.",
    "top_regions": [
      { "region": "China", "share": "54%", "status": "Stable" },
      { "region": "Indonesia", "share": "12%", "status": "Growing" },
      { "region": "USA", "share": "8%", "status": "Declining" }
    ]
  },
  "key_takeaways": ["Highly specific executive takeaway 1 with data", "Highly specific executive takeaway 2 with data", "Highly specific executive takeaway 3 with data", "Highly specific executive takeaway 4 with data", "Highly specific executive takeaway 5 with data"],
  "risk_factors": [
    { "title": "Specific Risk Title", "description": "Extensive, well-explained analysis (minimum 100-150 words) of the risk. Detail the underlying causes, specific indicators to watch, potential cascading effects on the optical fibre supply chain, and mitigation strategies.", "impact": "High" },
    { "title": "Specific Risk Title", "description": "Extensive, well-explained analysis (minimum 100-150 words) of the risk. Detail the underlying causes, specific indicators to watch, potential cascading effects on the optical fibre supply chain, and mitigation strategies.", "impact": "Medium" }
  ],
  "opportunities": [
    { "title": "Specific Opportunity Title", "description": "Extensive, well-explained analysis (minimum 100-150 words) of the opportunity. Detail the strategic advantage, specific implementation roadmap, potential cost/efficiency gains, and competitive positioning.", "potential": "High" },
    { "title": "Specific Opportunity Title", "description": "Extensive, well-explained analysis (minimum 100-150 words) of the opportunity. Detail the strategic advantage, specific implementation roadmap, potential cost/efficiency gains, and competitive positioning.", "potential": "Medium" }
  ],
  "sources": ["Full name of source 1", "Full name of source 2", "Full name of source 3", "Full name of source 4"]
}
"""
        prompt = f"""Use Google Search to conduct a comprehensive, data-driven deep research analysis for:
        
COMMODITY: {name} ({slug})
UNIT: {unit}
RELEVANCE TO OPTICAL FIBRE: {relevance}
{price_context}

Your research MUST be highly specific to the CURRENT month and year. We need DEPTH and BREADTH. 
Avoid brief summaries. Every section must be detailed enough so that a senior executive can fully understand the market landscape just by reading your analysis.

1. Current supply-demand balance: Provide a massive, multi-paragraph deep dive into the 'why'.
2. Geographic intelligence: Deeply explain regional shifts, geopolitical tensions, and policy impacts.
3. Strategic signals: Detailed capacity pipelines and trade bottlenecks.
4. Risk and Opportunity Analysis: Provide a full narrative for each risk and opportunity. It should feel like reading a professional analyst report, not a bullet list.

Provide your analysis as a JSON object with these exact keys:

{json_template}

Be specific, quantitative, and global. Use the most recent news from the last 30 days. Write in a professional, authoritative tone. 
Ensure all text fields are substantial, informative, and provide deep context.
"""

        try:
            response = await call_llm(prompt, system_instruction=RESEARCH_SYSTEM_PROMPT, use_search=True)
            analysis = json.loads(response)
            await save_analysis(slug, analysis)
            results[slug] = analysis
            print(f"  Analysis complete: {name}")
            
            # Rate limiting protection - increased for live API safety
            await asyncio.sleep(settings.AGENT_SLEEP_SECONDS)

        except json.JSONDecodeError:
            print(f"  Failed to parse analysis for {name}, saving raw text")
            await save_analysis(slug, {"raw_analysis": response, "parse_error": True})
        except Exception as e:
            print(f"  Error analyzing {name}: {e}")
            traceback.print_exc()

    print(f"Agent 2: Completed research for {len(results)}/{len(commodities)} commodities")
    return results
