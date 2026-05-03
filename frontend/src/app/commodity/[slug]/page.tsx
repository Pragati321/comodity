import { CommodityDetail } from "@/lib/types";
import { PriceChart } from "@/components/PriceChart";
import { IntelligenceFeed } from "@/components/IntelligenceFeed";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Target, 
  ShieldAlert, 
  Lightbulb,
  FileText,
  CheckCircle2,
  Newspaper
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

import { PrintButton } from "@/components/PrintButton";

async function getCommodityDetail(slug: string): Promise<CommodityDetail> {
  try {
    const res = await fetch(`http://127.0.0.1:8001/api/commodity/${slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch commodity data");
    return res.json();
  } catch (error) {
    console.error("Backend fetch failed, using mock detail data", error);
    // Return mock data
    return {
      name: slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      slug: slug,
      current_price: 9245.50,
      price_unit: "USD/ton",
      price_change_pct: 1.2,
      trend: "up",
      relevance: "This commodity is critical for high-voltage power transmission and data center cooling systems required for optical fiber installations.",
      historical_prices: Array.from({ length: 30 }, (_, i) => ({
        date: `2026-04-${i+1}`,
        price: 9000 + Math.random() * 500
      })),
      forecast_prices: Array.from({ length: 6 }, (_, i) => ({
        date: `Month +${i+1}`,
        price: 9245 + (i + 1) * 50 + Math.random() * 20
      })),
      key_takeaways: [
        "Global supply deficit expected to persist through Q4 2026.",
        "Strategic reserves should be maintained at 90 days of forward production.",
        "Geopolitical instability in key mining regions posing a 15% price risk."
      ],
      supply_demand: {
        summary: "Global market expected to face a deficit of 150k tons in 2026. Demand from renewable energy and EVs remains robust.",
        market_balance: "Deficit",
        global_inventory: "125,400 tons (LME)",
        production_capacity_utilization: "75%",
        demand_growth_yoy: "6.0%"
      },
      geographic_intelligence: {
        summary: "China remains the dominant consumer (54% global share). New smelting capacity coming online in Indonesia.",
        top_regions: [
          { region: "China", share: "54%", status: "Stable" },
          { region: "USA", share: "17%", status: "Growing" },
          { region: "Europe", share: "13%", status: "Stable" },
          { region: "India", share: "8%", status: "Growing" }
        ]
      },
      scenario_analysis: {
        bull: { label: "Bull Case", price_target: 10500, probability: "25%", rationale: "Supply disruptions intensify while US economy achieves soft landing." },
        base: { label: "Base Case", price_target: 9400, probability: "55%", rationale: "Gradual improvement in manufacturing offset by increased smelting output." },
        bear: { label: "Bear Case", price_target: 8200, probability: "20%", rationale: "Global recession fears lead to significant destocking." }
      },
      procurement_strategy: "Recommend hedging 60% of Q3 requirements at current levels. Increase spot purchases if price dips below target levels. Monitor LME inventory levels closely.",
      risk_factors: [
        { title: "Geopolitical Disruptions", description: "Tensions in Peru mining corridor causing logistics delays.", impact: "High" },
        { title: "Currency Volatility", description: "JPY corridor fluctuations affecting hedging strategies.", impact: "Medium" }
      ],
      opportunities: [
        { title: "Substitution Trends", description: "Slowing aluminum substitution boosts copper demand for subsea cables.", potential: "High" },
        { title: "Recycling Mandates", description: "New EU scrap recovery targets reducing primary metal dependence.", potential: "Medium" }
      ],
      related_intelligence: [
        {
          id: "int-1",
          timestamp: new Date().toISOString(),
          title: "Major mining operation in Peru announces force majeure",
          summary: "A significant strike at the Quellaveco mine is expected to reduce monthly output by 12%.",
          classification: "risk",
          source: "Reuters",
          source_url: "https://www.reuters.com/markets/commodities/peru-mining-disruption-quellaveco",
          related_commodities: [slug]
        },
        {
          id: "int-2",
          timestamp: new Date().toISOString(),
          title: "New recycling mandates in EU could boost secondary supply",
          summary: "The European Commission has proposed a 15% increase in mandatory recycled content for industrial cables.",
          classification: "opportunity",
          source: "Financial Times",
          source_url: "https://www.ft.com/content/eu-recycling-mandates-industry-impact",
          related_commodities: [slug]
        }
      ],
      sources: ["Industry Reports", "Global Commodity Exchange", "Logistics Watch"],
      health_index: 82,
      last_updated: new Date().toISOString(),
    };
  }
}

export default async function CommodityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log(`[DEBUG] Rendering CommodityPage for: ${slug}`);
  const data = await getCommodityDetail(slug);

  return (
    <div className="min-h-screen bg-mesh selection:bg-primary/30 pb-20 print:bg-white print:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between print:hidden">
          <a 
            href="/" 
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transform transition-transform group-hover:-translate-x-1" />
            Strategic Dashboard
          </a>
        </div>


        {/* Header Section */}
        <div className="mb-12 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-start lg:gap-20">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-primary/80">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse print:hidden" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Research Analysis</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight md:text-6xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase print:text-black print:from-black print:to-black">
              {data.name}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground/80 leading-relaxed font-medium print:text-gray-700">
              {data.relevance}
            </p>
          </div>

          
          <div className="glass-card rounded-2xl px-10 py-8 border-primary/20 relative overflow-hidden group min-w-[280px] print:border-gray-200 print:shadow-none">
             <div className={cn(
              "absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[60px] opacity-20 print:hidden",
              data.trend === "up" ? "bg-emerald-500" : data.trend === "down" ? "bg-red-500" : "bg-blue-500"
            )} />
            <div className="relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Live Spot Price</div>
              <div className="text-5xl font-black text-foreground mb-2 print:text-black">{formatCurrency(data.current_price, "")}</div>
              <div className={cn(
                "flex items-center gap-2 font-black text-sm",
                data.trend === "up" ? "text-emerald-500" : data.trend === "down" ? "text-red-500" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "rounded-full p-1 print:border print:border-gray-200",
                  data.trend === "up" ? "bg-emerald-400/10" : data.trend === "down" ? "bg-red-400/10" : "bg-slate-400/10"
                )}>
                  {data.trend === "up" ? <TrendingUp className="h-4 w-4" /> : data.trend === "down" ? <TrendingDown className="h-4 w-4" /> : null}
                </div>
                {data.price_change_pct}%
                <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest">{data.price_unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways Banner */}
        {data.key_takeaways && data.key_takeaways.length > 0 && (
          <div className="mb-12 glass-card rounded-3xl p-8 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground print:text-black">Executive Key Takeaways</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
              {data.key_takeaways.map((takeaway, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10 print:border-gray-200">
                  <div className="text-primary font-black text-xl opacity-40">0{i+1}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium print:text-gray-700">
                    {takeaway}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}


        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-12">
            {/* Chart Section */}
            <section className="glass-card rounded-3xl p-10 border-border overflow-hidden print:border-gray-200">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                  Price Performance & 6-Month Forecast
                </h3>
                <div className="flex gap-4 print:hidden">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Historical</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full border border-primary border-dashed" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Forecast</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px]">
                <PriceChart 
                  historical={data.historical_prices} 
                  forecast={data.forecast_prices} 
                  unit={data.price_unit} 
                />
              </div>
            </section>

            {/* Strategic Research Deep-Dive */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground print:text-black">Market Analysis Deep-Dive</h3>
              </div>
              
              <div className="glass-card rounded-3xl p-10 border-border space-y-10">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">Supply & Demand Dynamics</h4>
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {data.supply_demand.summary}
                  </p>
                </div>

                <div className="h-px bg-border/50" />

                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-foreground">Geographic Intelligence & Geopolitics</h4>
                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {data.geographic_intelligence.summary}
                  </p>
                </div>
              </div>
            </section>





            {/* Detailed Risks & Opportunities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-red-500">
                  <ShieldAlert className="h-5 w-5" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Strategic Risks</h3>
                </div>
                <div className="space-y-8">
                  {data.risk_factors.map((risk, i) => (
                    <div key={i} className="h-full space-y-3 p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-foreground uppercase">{risk.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded font-black uppercase">{risk.impact} Impact</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {risk.description}
                      </p>
                    </div>
                  ))}

                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-emerald-500">
                  <Lightbulb className="h-5 w-5" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Market Opportunities</h3>
                </div>
                <div className="space-y-8">
                  {data.opportunities.map((opp, i) => (
                    <div key={i} className="h-full space-y-3 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-foreground uppercase">{opp.title}</h4>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500 text-white rounded font-black uppercase">{opp.potential} Potential</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {opp.description}
                      </p>
                    </div>
                  ))}

                </div>
              </section>
            </div>

            {/* Related Intelligence Feed */}
            {data.related_intelligence && data.related_intelligence.length > 0 && (
              <section className="space-y-6 print:break-before-page">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Newspaper className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground print:text-black">Related Market Intelligence</h3>
                  </div>
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full lowercase">Last 72h</span>
                </div>
                <div className="max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <IntelligenceFeed items={data.related_intelligence} />
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">



            <div className="glass-card rounded-2xl p-8 border-white/5 print:border-gray-200">
              <div className="flex items-center gap-3 mb-6 text-primary print:text-black">
                <div className="rounded-lg bg-primary/10 p-2 border border-primary/20 print:bg-gray-100">
                  <Globe className="h-4 w-4" />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Regional Demand Share</h4>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  {data.geographic_intelligence.top_regions.map((reg, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-foreground">{reg.region}</span>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-sm uppercase font-black",
                          reg.status === "Growing" ? "bg-emerald-500/10 text-emerald-500" :
                          reg.status === "Declining" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                        )}>
                          {reg.status}
                        </span>
                      </div>
                      <span className="text-xs font-black text-muted-foreground/60">{reg.share}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
