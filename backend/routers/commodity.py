"""
Commodity Router — Serves detailed commodity view data.
Provides deep research analysis, price charts, scenarios, and procurement strategy.
"""
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import CommodityDetail, PricePoint
from services.data_service import (
    get_commodity, get_latest_price, get_price_history, get_latest_analysis
)

router = APIRouter(prefix="/api/commodity", tags=["commodity"])


@router.get("/{slug}", response_model=CommodityDetail)
async def get_commodity_detail(slug: str):
    """
    Get detailed commodity view including price history,
    deep research analysis, scenario modeling, and procurement strategy.
    """
    commodity = await get_commodity(slug)
    if not commodity:
        raise HTTPException(status_code=404, detail=f"Commodity '{slug}' not found")

    # Get price data
    latest_price = await get_latest_price(slug)
    price_history = await get_price_history(slug, limit=60)

    # Build historical price points - Deduplicated by day
    historical_map = {}
    for p in reversed(price_history):
        date_str = p.get("recorded_at", "")
        day_key = date_str.split("T")[0] if "T" in date_str else date_str.split(" ")[0]
        historical_map[day_key] = p.get("price", 0.0)
    
    historical = [PricePoint(date=d, price=v) for d, v in sorted(historical_map.items())]

    # Get analysis
    analysis = await get_latest_analysis(slug) or {}

    # Build scenario analysis with price targets
    current_price = latest_price["price"] if latest_price else 0.0
    scenario = analysis.get("scenario_analysis", {})

    # Convert multipliers to actual prices
    final_scenario = {}
    for case_key in ["bull", "base", "bear"]:
        case = scenario.get(case_key, {})
        multiplier = case.get("price_target_multiplier", 1.0)
        if isinstance(multiplier, (int, float)):
            target = round(current_price * multiplier, 2)
        else:
            target = current_price
        final_scenario[case_key] = {
            "label": case.get("label", case_key.capitalize() + " Case"),
            "price_target": target,
            "probability": case.get("probability", "N/A"),
            "rationale": case.get("rationale", "Analysis pending"),
        }

    # Generate real future dates for forecast
    forecast = []
    if current_price > 0:
        from datetime import timedelta
        base_mult = scenario.get("base", {}).get("price_target_multiplier", 1.02)
        if not isinstance(base_mult, (int, float)):
            base_mult = 1.02
            
        last_date = datetime.utcnow()
        for i in range(1, 7):
            # Roughly 30 days per month
            future_date = (last_date + timedelta(days=i * 30)).strftime('%Y-%m-%d')
            forecast_price = round(current_price * (1 + (base_mult - 1) * i / 6), 2)
            forecast.append(PricePoint(
                date=future_date,
                price=forecast_price
            ))

    # Calculate price change
    change_pct = 0.0
    trend = "stable"
    if len(historical) >= 2:
        old = historical[0].price
        new = historical[-1].price
        if old > 0:
            change_pct = round(((new - old) / old) * 100, 1)
            trend = "up" if change_pct > 0.5 else ("down" if change_pct < -0.5 else "stable")

    # Get related intelligence
    from services.data_service import get_related_feed
    related_items = await get_related_feed(slug)
    
    intelligence_objs = []
    for item in related_items:
        intelligence_objs.append({
            "id": item["id"],
            "timestamp": item.get("published_at", ""),
            "title": item.get("title", ""),
            "summary": item.get("summary", ""),
            "classification": item.get("classification", "normal"),
            "source": item.get("source", ""),
            "source_url": item.get("source_url", ""),
            "related_commodities": item.get("related_commodities", [])
        })

    # Calculate Market Health Index (Procurement-centric)
    # Start with 75. Lower cost (trend down) is better (+10). 
    # Risks decrease health (-12), Opportunities increase it (+8).
    health = 75
    if trend == "down":
        health += 10
    elif trend == "up":
        health -= 10
    
    for item in related_items:
        if item.get("classification") == "risk":
            health -= 12
        elif item.get("classification") == "opportunity":
            health += 8
    
    health_index = max(5, min(98, health))

    return CommodityDetail(
        name=commodity["name"],
        slug=slug,
        current_price=current_price,
        price_unit=commodity.get("unit", "USD/ton"),
        price_change_pct=change_pct,
        trend=trend,
        relevance=commodity.get("relevance", ""),
        historical_prices=historical,
        forecast_prices=forecast,
        supply_demand=analysis.get("supply_demand", {
            "summary": "Deep research analysis is being generated...",
            "market_balance": "Balanced",
            "global_inventory": "N/A",
            "production_capacity_utilization": "75%",
            "demand_growth_yoy": "0.0%"
        }),
        geographic_intelligence=analysis.get("geographic_intelligence", {
            "summary": "Geographic intelligence is being compiled...",
            "top_regions": []
        }),
        scenario_analysis=final_scenario,
        procurement_strategy=analysis.get("procurement_strategy", "Procurement strategy is being formulated..."),
        key_takeaways=analysis.get("key_takeaways", []),
        risk_factors=analysis.get("risk_factors", []),
        opportunities=analysis.get("opportunities", []),
        related_intelligence=intelligence_objs,
        sources=analysis.get("sources", []),
        health_index=health_index,
        last_updated=analysis.get("created_at", datetime.utcnow().isoformat() + "Z"),
    )
