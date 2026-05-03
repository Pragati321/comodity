
import { CommodityPrice } from "@/lib/types";
import { CommodityGrid } from "@/components/CommodityGrid";
import { ArrowLeft } from "lucide-react";

async function getCommodities(): Promise<CommodityPrice[]> {
  try {
    const res = await fetch("http://127.0.0.1:8001/api/dashboard", { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return data.commodities;
  } catch (e) {
    console.error("Failed to fetch commodities, using fallback data", e);
    return [
      {
        slug: "silicon-dioxide",
        name: "Silicon Dioxide (Silica)",
        current_price: 285.50,
        price_unit: "USD/ton",
        price_change_pct: 1.2,
        trend: "up",
        highlight: "Rising demand from 5G expansion offset by stable supply in China.",
        sparkline: [270, 275, 272, 280, 282, 284, 285.5],
        health_index: 85,
      },
      {
        slug: "germanium-dioxide",
        name: "Germanium Dioxide",
        current_price: 1850.00,
        price_unit: "USD/kg",
        price_change_pct: -0.8,
        trend: "down",
        highlight: "China export controls easing slightly leading to improved spot availability.",
        sparkline: [1900, 1880, 1890, 1870, 1860, 1865, 1850],
        health_index: 72,
      },
      {
        slug: "helium",
        name: "Liquid Helium",
        current_price: 4.85,
        price_unit: "USD/m3",
        price_change_pct: 5.4,
        trend: "up",
        highlight: "Planned maintenance at major Qatar plant causing temporary supply tightness.",
        sparkline: [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.85],
        health_index: 64,
      },
      {
        slug: "gold",
        name: "Gold",
        current_price: 2350.50,
        price_unit: "USD/oz",
        price_change_pct: 0.5,
        trend: "up",
        highlight: "Safe haven demand remains strong amid geopolitical uncertainties.",
        sparkline: [2300, 2310, 2320, 2330, 2340, 2345, 2350.5],
        health_index: 92,
      },
    ];
  }
}

export default async function CommoditiesPage() {
  const commodities = await getCommodities();

  return (
    <div className="min-h-screen bg-mesh selection:bg-primary/30 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-10">
          <a 
            href="/" 
            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transform transition-transform group-hover:-translate-x-1" />
            Strategic Dashboard
          </a>
        </div>

        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Market Explorer
          </h1>
          <p className="mt-4 text-muted-foreground/80 max-w-2xl">
            Real-time monitoring of critical raw materials for the optical fibre supply chain. 
            Deep research and predictive analytics for every tracked asset.
          </p>
        </div>

        <CommodityGrid commodities={commodities} />
      </div>
    </div>
  );
}
