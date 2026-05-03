"use client";

import { CommodityPrice } from "@/lib/types";
import { CommodityCard } from "./CommodityCard";

interface CommodityGridProps {
  commodities: CommodityPrice[];
  title?: string;
  cols?: "2" | "3";
}

export function CommodityGrid({ commodities, title, cols = "3" }: CommodityGridProps) {
  const gridColsClass = cols === "2" 
    ? "grid grid-cols-1 gap-6 sm:grid-cols-2" 
    : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="space-y-6">
      {title && (
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 mb-6">
          {title}
        </h3>
      )}

      {Array.isArray(commodities) && commodities.length > 0 ? (
        <div className={gridColsClass}>
          {commodities.map((c) => (
            <CommodityCard key={c.slug} commodity={c} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center glass-card rounded-2xl border-dashed border-2 border-border/50">
          <h3 className="text-xl font-bold text-foreground">No commodities available</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Strategic market intelligence is being compiled. Please check back shortly.
          </p>
        </div>
      )}
    </div>
  );
}
