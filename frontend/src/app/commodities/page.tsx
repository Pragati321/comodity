"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CommodityDetail } from "@/lib/types";
import apiClient from "@/lib/api-client";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

export default function CommodityDetailPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  
  const [commodity, setCommodity] = useState<CommodityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchCommodityDetail() {
      try {
        setLoading(true);
        const data = await apiClient.get<CommodityDetail>(
          `/api/commodities/${slug}`
        );
        setCommodity(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch commodity detail:", err);
        setError("Unable to load commodity details");
      } finally {
        setLoading(false);
      }
    }

    fetchCommodityDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading commodity details...</p>
        </div>
      </div>
    );
  }

  if (error || !commodity) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-muted-foreground">{error || "Commodity not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Back Button */}
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{commodity.name}</h1>
              <p className="text-lg text-muted-foreground">{commodity.slug}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {commodity.current_price} {commodity.price_unit}
              </div>
              <div className={`flex items-center justify-end gap-2 text-lg font-semibold mt-2 ${
                commodity.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {commodity.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {commodity.price_change_pct > 0 ? '+' : ''}{commodity.price_change_pct}%
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Relevance */}
            <section className="bg-secondary/50 rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold mb-4">Market Relevance</h2>
              <p className="text-foreground/90">{commodity.relevance}</p>
            </section>

            {/* Supply & Demand */}
            <section className="bg-secondary/50 rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold mb-4">Supply & Demand Analysis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Summary</h3>
                  <p className="text-foreground/90">{commodity.supply_demand.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Market Balance</h3>
                  <p className="text-foreground/90">{commodity.supply_demand.market_balance}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">Demand Growth (YoY)</h3>
                  <p className="text-foreground/90">{commodity.supply_demand.demand_growth_yoy}</p>
                </div>
              </div>
            </section>

            {/* Key Takeaways */}
            <section className="bg-secondary/50 rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold mb-4">Key Takeaways</h2>
              <ul className="space-y-2">
                {commodity.key_takeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex gap-3 text-foreground/90">
                    <span className="text-primary font-bold">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Index */}
            <div className="bg-secondary/50 rounded-lg p-6 border border-border">
              <h3 className="font-bold text-sm text-muted-foreground mb-4">Health Index</h3>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold text-primary">{commodity.health_index}</div>
                <span className="text-muted-foreground mb-1">/100</span>
              </div>
              <div className="mt-4 w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full"
                  style={{ width: `${commodity.health_index}%` }}
                />
              </div>
            </div>

            {/* Risk Factors */}
            {commodity.risk_factors.length > 0 && (
              <div className="bg-secondary/50 rounded-lg p-6 border border-border">
                <h3 className="font-bold text-sm text-muted-foreground mb-3">Risk Factors</h3>
                <div className="space-y-2">
                  {commodity.risk_factors.map((risk, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-semibold text-foreground mb-1">{risk.title}</p>
                      <p className="text-xs text-muted-foreground mb-1">{risk.description}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        risk.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                        risk.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {risk.impact} Impact
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
