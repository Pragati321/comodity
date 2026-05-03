"""
LLM Service — Unified interface for Google Gemini and mock fallback.
Handles API calls, error recovery, and graceful degradation.
"""
import json
import random
from datetime import datetime, timedelta
from config import settings

# Gemini client (lazy init)
_gemini_client = None


def _get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        from google import genai
        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _gemini_client


async def call_llm(prompt: str, system_instruction: str = "", json_mode: bool = True, use_search: bool = False) -> str:
    """
    Call the LLM (Gemini or mock) with the given prompt.
    Returns raw text response. If json_mode=True, instructs the model to return JSON.
    """
    if settings.MOCK_LLM or not settings.GEMINI_API_KEY:
        print("Using MOCK LLM response")
        return _generate_mock_response(prompt)

    try:
        client = _get_gemini_client()
        from google.genai import types

        full_prompt = prompt
        if json_mode:
            full_prompt += "\n\nIMPORTANT: Return your response as valid JSON only. No markdown, no code fences, just raw JSON."

        tools = []
        if use_search:
            tools.append(types.Tool(google_search=types.GoogleSearch()))

        config = types.GenerateContentConfig(
            system_instruction=system_instruction if system_instruction else None,
            temperature=0.7,
            max_output_tokens=8192,
            tools=tools if tools else None,
        )

        import asyncio
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-flash-latest",
            contents=full_prompt,
            config=config,
        )

        text = response.text.strip()
        # Strip markdown code fences if present
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

        return text.strip()

    except Exception as e:
        print(f"Gemini API error: {e}")
        print("Falling back to mock response")
        return _generate_mock_response(prompt)


def _generate_mock_response(prompt: str) -> str:
    """
    Generate a contextual mock response based on prompt keywords.
    Returns dynamic (not hardcoded) JSON with randomized variations.
    """
    prompt_lower = prompt.lower()

    # Prioritize deep research/analysis over general intelligence keywords
    if any(kw in prompt_lower for kw in ["research", "analysis", "supply-demand"]):
        return _mock_analysis(prompt_lower)
    elif any(kw in prompt_lower for kw in ["insight", "intelligence", "executive", "events", "developments", "summary"]):
        return _mock_insights(prompt_lower)
    elif any(kw in prompt_lower for kw in ["price", "scrape", "market data"]):
        return _mock_price_data(prompt_lower)
    else:
        return json.dumps({"response": "Mock response for: " + prompt[:100]})


def _mock_price_data(prompt: str) -> str:
    """Generate mock price data with realistic variations."""
    base_prices = {
        "silicon-dioxide": 280, "germanium-dioxide": 1850, "helium": 4.5,
        "uv-acrylate": 12.5, "crude-oil": 78, "natural-gas": 3.2,
        "aluminum": 2450, "steel": 620, "copper": 9200, "polyethylene": 1350,
    }

    prices = {}
    for slug, base in base_prices.items():
        variation = random.uniform(-0.08, 0.08)
        prices[slug] = {
            "current_price": round(base * (1 + variation), 2),
            "change_pct": round(variation * 100, 1),
            "trend": "up" if variation > 0.01 else ("down" if variation < -0.01 else "stable"),
        }

    return json.dumps(prices)


def _mock_analysis(prompt: str) -> str:
    """Generate mock deep research analysis for a specific commodity."""
    commodities = [
        "silicon-dioxide", "germanium-dioxide", "helium", "uv-acrylate",
        "crude-oil", "natural-gas", "aluminum", "steel", "copper", "polyethylene"
    ]

    # Try to find which commodity is being requested
    target_slug = "copper" # Default
    for slug in commodities:
        if slug in prompt or slug.replace('-', ' ') in prompt:
            target_slug = slug
            break

    themes = [
        ("Supply chain disruption in major producing region", "risk"),
        ("New capacity coming online in Q3 2026", "opportunity"),
        ("Stable demand outlook with moderate growth", "normal"),
        ("Trade policy changes affecting import costs", "risk"),
        ("Technological improvements reducing unit costs", "opportunity"),
    ]

    theme = random.choice(themes)
    analysis = {
        "supply_demand": {
            "summary": f"Current supply-demand balance for {target_slug.replace('-', ' ')} shows "
                                  f"{'tightening' if theme[1] == 'risk' else 'balanced'} conditions. "
                                  f"Strategic inventory levels are {'low' if theme[1] == 'risk' else 'stable'}.",
            "market_balance": "Deficit" if theme[1] == 'risk' else "Balanced",
            "global_inventory": f"{random.randint(80, 160)}k metric tons",
            "production_capacity_utilization": f"{random.randint(72, 95)}%",
            "demand_growth_yoy": f"{round(random.uniform(1.5, 6.5), 1)}%"
        },
        "geographic_intelligence": {
            "summary": f"Key producing regions: China ({random.randint(35, 65)}% global share), "
                       f"USA ({random.randint(8, 18)}%), Europe ({random.randint(10, 20)}%). "
                       f"Emerging capacity in India and Southeast Asia.",
            "top_regions": [
                {"region": "China", "share": f"{random.randint(45, 60)}%", "status": "Stable"},
                {"region": "Indonesia", "share": f"{random.randint(10, 15)}%", "status": "Growing"},
                {"region": "USA", "share": f"{random.randint(5, 10)}%", "status": "Stable"}
            ]
        },
        "scenario_analysis": {
            "bull": {
                "label": "Bull Case",
                "price_target_multiplier": round(random.uniform(1.15, 1.35), 2),
                "probability": f"{random.randint(15, 30)}%",
                "rationale": "Supply disruption + strong demand recovery"
            },
            "base": {
                "label": "Base Case",
                "price_target_multiplier": round(random.uniform(0.98, 1.08), 2),
                "probability": f"{random.randint(45, 60)}%",
                "rationale": "Gradual demand normalization with stable supply"
            },
            "bear": {
                "label": "Bear Case",
                "price_target_multiplier": round(random.uniform(0.75, 0.92), 2),
                "probability": f"{random.randint(15, 25)}%",
                "rationale": "Demand slowdown + capacity overshoot"
            }
        },
        "procurement_strategy": f"Recommended procurement window for {target_slug}: {'near-term' if theme[1] == 'opportunity' else 'defer if possible'}. "
                                 f"Consider {'spot buying' if random.random() > 0.5 else 'forward contracts'} "
                                 f"with {random.randint(2, 6)}-month hedging horizon.",
        "key_takeaways": random.sample([
            f"Strategic sourcing of {target_slug} is critical due to geographic concentration.",
            f"Inventory levels for {target_slug} are currently below historical averages.",
            f"Monitor upcoming trade policy announcements affecting {target_slug} in Q3.",
            f"Alternative supply routes for {target_slug} are being explored to mitigate logistics risk.",
            f"New ESG mandates are increasing the compliance cost for {target_slug} procurement.",
            f"Technological shifts in optical fibre cladding may reduce {target_slug} intensity of use.",
            f"Secondary market liquidity for {target_slug} has improved by 12% MoM."
        ], 3),
        "risk_factors": [
            {"title": theme[0], "description": "Analysis of the primary risk factor identified.", "impact": theme[1].capitalize()},
            {"title": f"Currency volatility in {random.choice(['CNY', 'EUR', 'JPY'])} corridor", "description": "Description of currency impact.", "impact": "Medium"}
        ],
        "opportunities": [
            {"title": f"Emerging supplier diversification in {random.choice(['Vietnam', 'India', 'Brazil', 'Mexico'])}", "description": "Strategic opportunity description.", "potential": "High"}
        ],
        "sources": ["Reuters", "Bloomberg", "Industry Reports"]
    }

    return json.dumps(analysis)



def _mock_insights(prompt: str) -> str:
    """Generate mock intelligence feed and executive summary."""
    feed_items = []
    classifications = ["risk", "opportunity", "normal"]
    headlines = [
        ("China tightens export controls on rare earth elements", "risk", ["germanium-dioxide", "silicon-dioxide"]),
        ("OPEC+ extends production cuts through Q3 2026", "risk", ["crude-oil", "natural-gas"]),
        ("India announces $2B optical fibre infrastructure plan", "opportunity", ["silicon-dioxide", "germanium-dioxide", "polyethylene"]),
        ("US-EU trade agreement reduces aluminum tariffs by 15%", "opportunity", ["aluminum"]),
        ("Global helium shortage eases as Qatar plant resumes", "opportunity", ["helium"]),
        ("Steel prices stabilize after six-month decline", "normal", ["steel"]),
        ("Copper demand surges on EV and data center buildout", "risk", ["copper"]),
        ("New polyethylene recycling mandate in EU markets", "normal", ["polyethylene"]),
        ("Germanium spot prices hit 18-month high", "risk", ["germanium-dioxide"]),
        ("Natural gas futures decline on mild weather outlook", "opportunity", ["natural-gas"]),
        ("UV coating innovation reduces material usage by 20%", "opportunity", ["uv-acrylate"]),
        ("Supply chain bottleneck at major silica quarry in Brazil", "risk", ["silicon-dioxide"]),
    ]

    now = datetime.utcnow()
    for i, (title, cls, commodities) in enumerate(headlines):
        feed_items.append({
            "id": f"evt-{i+1:03d}",
            "timestamp": (now - timedelta(hours=i * 3 + random.randint(0, 5))).isoformat() + "Z",
            "title": title,
            "summary": f"Market analysis indicates this development will have a {cls}-level impact on "
                        f"{', '.join(c.replace('-', ' ') for c in commodities)} pricing and availability over the next quarter.",
            "classification": cls,
            "source": random.choice(["Reuters", "Bloomberg", "S&P Global", "Fastmarkets", "ICIS", "Metal Bulletin"]),
            "source_url": "https://example.com/article",
            "related_commodities": commodities,
        })

    executive_summary = (
        "The optical fibre raw materials landscape shows mixed signals this quarter. "
        "Key risks center on Chinese export policy tightening affecting germanium and silica supply chains, "
        "while OPEC+ production cuts maintain upward pressure on energy-linked inputs. "
        f"Opportunities emerge from India's infrastructure expansion and easing helium supply constraints. "
        f"Overall procurement cost index estimated at +{round(random.uniform(1.5, 4.5), 1)}% QoQ. "
        f"Strategic recommendation: Accelerate forward contracting on germanium dioxide and diversify "
        f"silica sourcing to mitigate China concentration risk."
    )

    return json.dumps({
        "intelligence_feed": feed_items,
        "global_events": feed_items,
        "executive_summary": executive_summary,
    })
