"use client";

import { Quote } from "lucide-react";

interface ExecutiveSummaryProps {
  summary: string;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  const cleanSummary = summary
    .replace(/\((Risk|Opportunity|Normal|Insight|Observation|Trend|Source)[^)]*\)/gi, "")
    .replace(/\s\s+/g, " ")
    .trim();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-card to-emerald-500/10 border border-border p-6 md:p-8">
      <div className="absolute -top-4 -left-4 text-primary/5">
        <Quote className="h-24 w-24" />
      </div>
      
      <div className="relative">
        <h2 className="text-lg font-bold uppercase tracking-[0.2em] text-primary mb-4">
          Executive Summary
        </h2>
        <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
          {cleanSummary}
        </p>

      </div>
    </div>
  );
}
