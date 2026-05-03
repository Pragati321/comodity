"use client";

import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CommodityPrice } from "@/lib/types";

interface CommodityCardProps {
  commodity: CommodityPrice;
}

export function CommodityCard({ commodity }: CommodityCardProps) {
  const isUp = commodity.trend === "up";
  const isDown = commodity.trend === "down";

  // Format sparkline data for Recharts - with safety check
  const sparkline = Array.isArray(commodity.sparkline) ? commodity.sparkline : [];
  const chartData = sparkline.map((val, i) => ({ value: val }));

  return (
    <div className={cn(
      "glass-card group relative overflow-hidden rounded-xl p-6 transition-all hover:scale-[1.02] hover:bg-white/[0.04]",
      isUp ? "hover:border-emerald-500/20" : isDown ? "hover:border-red-500/20" : "hover:border-blue-500/20"
    )}>
      {/* Dynamic Background Glow */}
      <div className={cn(
        "absolute -right-8 -top-8 h-24 w-24 rounded-full blur-[60px] opacity-20 transition-opacity group-hover:opacity-40",
        isUp ? "bg-emerald-500" : isDown ? "bg-red-500" : "bg-blue-500"
      )} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{commodity.name}</h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {formatCurrency(commodity.current_price, "")}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{commodity.price_unit}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold",
            isUp ? "text-emerald-500" : isDown ? "text-red-500" : "text-muted-foreground"
          )}>
            <div className={cn(
              "rounded-full p-0.5",
              isUp ? "bg-emerald-400/10" : isDown ? "bg-red-400/10" : "bg-slate-400/10"
            )}>
              {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : isDown ? <ArrowDownRight className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
            </div>
            {isUp ? "+" : ""}{commodity.price_change_pct}%
          </div>
        </div>
        
        <div className="h-16 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isUp ? "#10b981" : isDown ? "#ef4444" : "#3b82f6"}
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      


      <div className="mt-4 flex justify-end relative z-10">
        <a 
          href={`/commodity/${commodity.slug}`}
          className="text-[10px] font-bold uppercase tracking-widest text-primary/80 hover:text-primary transition-colors flex items-center gap-1"
        >
          Detailed Intelligence
          <span className="text-xs">→</span>
        </a>
      </div>
    </div>
  );
}
