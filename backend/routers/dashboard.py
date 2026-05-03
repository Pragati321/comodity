"""
Dashboard Router — Serves the CXO dashboard data.
Aggregates commodity prices, executive summary, and intelligence feed.
"""
import json
from datetime import datetime
from fastapi import APIRouter
from models import DashboardResponse, CommodityPrice, IntelligenceItem
from services.data_service import (
    get_all_commodities, get_latest_price, get_price_sparkline,
    get_feed, get_latest_summary, get_latest_analysis,
    get_last_feed_update
)

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard():
    """
    Get the full CXO dashboard data.
    Includes commodity prices, intelligence feed, and executive summary.
    """
    commodities = await get_all_commodities()
    commodity_prices = []

    for c in commodities:
        slug = c["slug"]
        price = await get_latest_price(slug)
        sparkline = await get_price_sparkline(slug)
        analysis = await get_latest_analysis(slug)

        # Calculate price change from sparkline
        change_pct = 0.0
        trend = "stable"
        if sparkline and len(sparkline) >= 2:
            old_price = sparkline[0]
            new_price = sparkline[-1]
            if old_price > 0:
                change_pct = round(((new_price - old_price) / old_price) * 100, 1)
                trend = "up" if change_pct > 0.5 else ("down" if change_pct < -0.5 else "stable")

        # Get highlight from analysis
        highlight = ""
        if analysis:
            risk_factors = analysis.get("risk_factors", [])
            opportunities = analysis.get("opportunities", [])
            
            def extract_text(item):
                if isinstance(item, dict):
                    return item.get('description') or item.get('title') or str(item)
                return str(item)

            if risk_factors and len(risk_factors) > 0:
                highlight = extract_text(risk_factors[0])
            elif opportunities and len(opportunities) > 0:
                highlight = extract_text(opportunities[0])


        commodity_prices.append(CommodityPrice(
            slug=slug,
            name=c["name"],
            current_price=price["price"] if price else 0.0,
            price_unit=c.get("unit", "USD/ton"),
            price_change_pct=change_pct,
            trend=trend,
            highlight=highlight[:200] if highlight else f"Monitoring {c['name']} market conditions",
            sparkline=sparkline,
        ))

    # Get intelligence feed
    feed_rows = await get_feed(limit=40)
    feed_items = []
    for row in feed_rows:
        related = row.get("related_commodities", [])
        if isinstance(related, str):
            try:
                related = json.loads(related)
            except:
                related = []

        feed_items.append(IntelligenceItem(
            id=row.get("id", ""),
            timestamp=row.get("published_at", ""),
            title=row.get("title", ""),
            summary=row.get("summary", ""),
            classification=row.get("classification", "normal"),
            source=row.get("source", ""),
            source_url=row.get("source_url", ""),
            related_commodities=related,
        ))

    # Get executive summary
    summary = await get_latest_summary()

    # Get last updated timestamp from database
    last_updated = await get_last_feed_update()

    return DashboardResponse(
        commodities=commodity_prices,
        executive_summary=summary,
        intelligence_feed=feed_items,
        last_updated=last_updated,
    )
