"use client";

import { AlertCircle, TrendingUp, Circle } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { IntelligenceItem } from "@/lib/types";

interface IntelligenceFeedProps {
  items: IntelligenceItem[];
}

export function IntelligenceFeed({ items }: IntelligenceFeedProps) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-border last:before:bottom-2"
        >
          <div className={cn(
            "absolute left-[-4px] top-2 h-2 w-2 rounded-full",
            item.classification === "risk" ? "bg-red-500 glow-red" :
              item.classification === "opportunity" ? "bg-emerald-500 glow-green" :
                "bg-blue-500 glow-blue"
          )} />

          <div className="glass-card rounded-lg p-4 transition-colors hover:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  item.classification === "risk" ? "bg-red-500/10 text-red-500" :
                    item.classification === "opportunity" ? "bg-emerald-500/10 text-emerald-500" :
                      "bg-blue-500/10 text-blue-500"
                )}>
                  {item.classification === "risk" && <AlertCircle className="h-3 w-3" />}
                  {item.classification === "opportunity" && <TrendingUp className="h-3 w-3" />}
                  {item.classification === "normal" && <Circle className="h-2 w-2" />}
                  {item.classification}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatDate(item.timestamp)}
                </span>
              </div>
            </div>


            <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <h4 className="mt-2 font-semibold text-sm leading-snug">
                {item.title}
              </h4>
            </a>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {item.summary}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {item.related_commodities.map((slug) => (
                  <span
                    key={slug}
                    className="rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground uppercase"
                  >
                    {slug.replace("slug-", "")}
                  </span>
                ))}
              </div>

              <a 
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[8px] font-bold uppercase tracking-widest text-primary/80 hover:text-primary hover:underline flex items-center gap-1 max-w-[200px]"
              >
                <span className="truncate">Source: {item.source}</span>
                <span className="text-[10px]">→</span>
              </a>

            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
