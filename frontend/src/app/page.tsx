import { DashboardData } from "@/lib/types";
import { CommodityGrid } from "@/components/CommodityGrid";
import { IntelligenceFeed } from "@/components/IntelligenceFeed";
import { ExecutiveSummary } from "@/components/ExecutiveSummary";
import { SyncButton } from "@/components/SyncButton";
import { Clock } from "lucide-react";

async function getDashboardData(): Promise<DashboardData> {
  try {
    const res = await fetch("http://127.0.0.1:8001/api/dashboard", { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) {
      console.warn(`Backend responded with status: ${res.status}`);
      throw new Error("Failed to fetch dashboard data");
    }
    return await res.json();
  } catch (error) {
    console.error("Backend fetch failed, using mock data", error);
    // Return mock data for development
    return {
      commodities: [
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
      ],
      executive_summary: "The optical fibre raw materials market is experiencing a period of localized volatility. Silicon dioxide remains under upward pressure due to infrastructure rollouts, while germanium has stabilized following recent policy shifts. Helium supply remains a critical watchpoint for Q3. We recommend accelerating silicon procurement and maintaining strategic reserves of germanium.",
      intelligence_feed: [
        {
          id: "evt-001",
          timestamp: new Date().toISOString(),
          title: "New silica processing plant announced in Vietnam",
          summary: "A $150M facility is expected to add 200,000 tons of high-purity silica to the global market by late 2027.",
          classification: "opportunity",
          source: "Nikkei Asia",
          source_url: "https://asia.nikkei.com/Business/Materials/Silica-processing-hub-Vietnam",
          related_commodities: ["silicon-dioxide"],
        },
        {
          id: "evt-002",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          title: "Logistics strike at Port of Antwerp affects chemical shipments",
          summary: "Potential delays for UV-acrylate and polymer imports into European manufacturing sites.",
          classification: "risk",
          source: "Bloomberg",
          source_url: "https://www.bloomberg.com/news/articles/2026-05-01/port-strikes-global-supply-chains",
          related_commodities: ["polyethylene"],
        },
      ],
      last_updated: "2026-05-01T12:00:00Z",
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data || !data.commodities) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Intelligence</h2>
          <p className="text-muted-foreground">Unable to retrieve strategic market data. Please verify backend connectivity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh selection:bg-primary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        {/* Dashboard Header */}
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/80">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Live Intelligence</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3 italic uppercase">
              STL&nbsp;<span className="text-primary not-italic">COMIQ</span> Dashboard
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground/80">
              Strategic commodity insights for optical fibre manufacturing supply chain resilience.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SyncButton />
            <div className="flex items-center gap-3 rounded-full bg-secondary px-4 py-2 text-[10px] font-medium text-muted-foreground border border-border backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              <span>Last Synced: {new Date(data.last_updated).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content: Summary & Commodities */}
          <div className="lg:col-span-2 space-y-10">
            <section className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent rounded-full opacity-50" />
              <ExecutiveSummary summary={data.executive_summary} />
            </section>

            <section>
              <CommodityGrid 
                commodities={data.commodities} 
                title="Tracked Commodities" 
                cols="3"
              />
            </section>
          </div>

          {/* Sidebar: Intelligence Feed */}
          <div className="space-y-8">


            <div>
              <h3 className="mb-6 px-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center justify-between">
                <span>Global Intelligence</span>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full lowercase">Last 72h</span>
              </h3>
              <div className="max-h-[1200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <IntelligenceFeed items={data.intelligence_feed} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
