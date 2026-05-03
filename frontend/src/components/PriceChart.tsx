"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrency, cn, formatDate } from "@/lib/utils";
import { PricePoint } from "@/lib/types";

interface PriceChartProps {
  historical: PricePoint[];
  forecast: PricePoint[];
  unit: string;
}

export function PriceChart({ historical, forecast, unit }: PriceChartProps) {
  // Combine data for a unified timeline
  const sortedHistorical = [...historical].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedForecast = [...forecast].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const chartData: { date: string; price_historical: number | null; price_forecast: number | null }[] = [
    ...sortedHistorical.map((d) => ({ 
      date: d.date, 
      price_historical: d.price, 
      price_forecast: null as number | null
    })),
  ];

  // Add the bridge point and forecast
  if (sortedHistorical.length > 0 && sortedForecast.length > 0) {
    const lastHist = sortedHistorical[sortedHistorical.length - 1];
    // Add bridge point to current day
    chartData[chartData.length - 1].price_forecast = lastHist.price;
    
    // Add future points
    sortedForecast.forEach(f => {
      chartData.push({
        date: f.date,
        price_historical: null,
        price_forecast: f.price
      });
    });
  }

  return (
    <div className="h-[300px] w-full md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3142" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => {
              if (typeof value === 'string' && value.includes('-')) {
                try {
                  return formatDate(value);
                } catch {
                  return value;
                }
              }
              return value;
            }}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="glass-card rounded-xl p-4 border-white/10 shadow-2xl backdrop-blur-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2">
                      {typeof label === 'string' && label.includes('-') ? formatDate(label) : label}
                    </p>
                    <div className="flex flex-col gap-2">
                      {payload.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            item.dataKey === "price_forecast" ? "bg-emerald-500" : "bg-primary"
                          )} />
                          <p className="text-lg font-black text-white">
                            {formatCurrency(item.value as number, "")}
                            <span className="text-[10px] ml-1 text-muted-foreground/60">{unit}</span>
                          </p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-primary/80">
                            {item.dataKey === "price_forecast" ? "Forecast" : "Historical"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price_historical"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            name="Historical"
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="price_forecast"
            stroke="#10b981"
            strokeWidth={3}
            strokeDasharray="5 5"
            fillOpacity={1}
            fill="url(#colorForecast)"
            name="Forecast"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
