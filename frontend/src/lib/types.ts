export interface CommodityPrice {
  slug: string;
  name: string;
  current_price: number;
  price_unit: string;
  price_change_pct: number;
  trend: "up" | "down" | "stable";
  highlight: string;
  sparkline: number[];
  health_index: number; // 0-100 score
}

export interface IntelligenceItem {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  classification: "risk" | "opportunity" | "normal";
  source: string;
  source_url: string;
  related_commodities: string[];
}

export interface DashboardData {
  commodities: CommodityPrice[];
  executive_summary: string;
  intelligence_feed: IntelligenceItem[];
  last_updated: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface ScenarioCase {
  label: string;
  price_target: number;
  probability: string;
  rationale: string;
}

export interface ScenarioAnalysis {
  bull: ScenarioCase;
  base: ScenarioCase;
  bear: ScenarioCase;
}

export interface SupplyDemandAnalysis {
  summary: string;
  market_balance: string;
  global_inventory: string;
  production_capacity_utilization: string;
  demand_growth_yoy: string;
}

export interface RegionShare {
  region: string;
  share: string;
  status: "Stable" | "Growing" | "Declining";
}

export interface GeographicIntelligence {
  summary: string;
  top_regions: RegionShare[];
}

export interface RiskFactor {
  title: string;
  description: string;
  impact: "Low" | "Medium" | "High";
}

export interface MarketOpportunity {
  title: string;
  description: string;
  potential: "Low" | "Medium" | "High";
}

export interface CommodityDetail {
  name: string;
  slug: string;
  current_price: number;
  price_unit: string;
  price_change_pct: number;
  trend: "up" | "down" | "stable";
  relevance: string;
  historical_prices: PricePoint[];
  forecast_prices: PricePoint[];
  supply_demand: SupplyDemandAnalysis;
  geographic_intelligence: GeographicIntelligence;
  scenario_analysis: ScenarioAnalysis;
  procurement_strategy: string;
  key_takeaways: string[];
  risk_factors: RiskFactor[];
  opportunities: MarketOpportunity[];
  related_intelligence: IntelligenceItem[];
  sources: string[];
  health_index: number; // 0-100 score
  last_updated: string;
}

export interface ManagedCommodity {
  slug: string;
  name: string;
  unit: string;
  relevance: string;
}
