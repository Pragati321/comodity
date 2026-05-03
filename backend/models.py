"""
Pydantic models for API request/response validation.
All fields have sensible defaults for defensive handling.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- Auth ---
class LoginRequest(BaseModel):
    email: str = ""
    password: str = ""


class UserInfo(BaseModel):
    name: str = "Demo User"
    role: str = "Executive"
    email: str = ""


class LoginResponse(BaseModel):
    token: str = "demo-token"
    user: UserInfo = UserInfo()


# --- Commodity ---
class CommodityPrice(BaseModel):
    slug: str
    name: str
    current_price: float = 0.0
    price_unit: str = "USD/ton"
    price_change_pct: float = 0.0
    trend: str = "stable"  # "up" | "down" | "stable"
    highlight: str = ""
    sparkline: list[float] = Field(default_factory=list)
    health_index: int = 85


class CommodityManagementRequest(BaseModel):
    slug: str
    name: str
    unit: str = "USD/ton"
    relevance: str = ""


# --- Intelligence Feed ---
class IntelligenceItem(BaseModel):
    id: str
    timestamp: str = ""
    title: str = ""
    summary: str = ""
    classification: str = "normal"  # "risk" | "opportunity" | "normal"
    source: str = ""
    source_url: str = ""
    related_commodities: list[str] = Field(default_factory=list)


# --- Dashboard ---
class DashboardResponse(BaseModel):
    commodities: list[CommodityPrice] = Field(default_factory=list)
    executive_summary: str = ""
    intelligence_feed: list[IntelligenceItem] = Field(default_factory=list)
    last_updated: str = ""


# --- Commodity Detail ---
class PricePoint(BaseModel):
    date: str
    price: float


class ScenarioCase(BaseModel):
    label: str = ""
    price_target: float = 0.0
    probability: str = ""
    rationale: str = ""


class SupplyDemandAnalysis(BaseModel):
    summary: str = ""
    market_balance: str = "Balanced" # Balanced, Deficit, Surplus
    global_inventory: str = ""
    production_capacity_utilization: str = "75%"
    demand_growth_yoy: str = "0.0%"

class RegionShare(BaseModel):
    region: str = ""
    share: str = ""
    status: str = "Stable" # Stable, Growing, Declining

class GeographicIntelligence(BaseModel):
    summary: str = ""
    top_regions: list[RegionShare] = Field(default_factory=list)

class RiskFactor(BaseModel):
    title: str = ""
    description: str = ""
    impact: str = "Medium" # Low, Medium, High

class MarketOpportunity(BaseModel):
    title: str = ""
    description: str = ""
    potential: str = "High" # Low, Medium, High

class CommodityDetail(BaseModel):
    name: str = ""
    slug: str = ""
    current_price: float = 0.0
    price_unit: str = "USD/ton"
    price_change_pct: float = 0.0
    trend: str = "stable"
    relevance: str = ""
    historical_prices: list[PricePoint] = Field(default_factory=list)
    forecast_prices: list[PricePoint] = Field(default_factory=list)
    supply_demand: SupplyDemandAnalysis = Field(default_factory=SupplyDemandAnalysis)
    geographic_intelligence: GeographicIntelligence = Field(default_factory=GeographicIntelligence)
    scenario_analysis: dict = Field(default_factory=lambda: {
        "bull": {"label": "Bull", "price_target": 0, "probability": "", "rationale": ""},
        "base": {"label": "Base", "price_target": 0, "probability": "", "rationale": ""},
        "bear": {"label": "Bear", "price_target": 0, "probability": "", "rationale": ""},
    })
    procurement_strategy: str = ""
    key_takeaways: list[str] = Field(default_factory=list)
    risk_factors: list[RiskFactor] = Field(default_factory=list)
    opportunities: list[MarketOpportunity] = Field(default_factory=list)
    related_intelligence: list[IntelligenceItem] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
    health_index: int = 85
    last_updated: str = ""
