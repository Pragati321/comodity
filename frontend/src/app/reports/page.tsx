"use client";

import { FileText, ArrowLeft, Download, Clock, ShieldCheck, Loader2 } from "lucide-react";
import React, { useState, useMemo } from "react";

export default function ReportsPage() {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Generate reports for the last 7 days
  const reports = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      return {
        id: i,
        title: `Daily Intelligence Briefing: ${formattedDate}`,
        date: dateStr,
        size: `${(1.2 + Math.random() * 0.8).toFixed(1)} MB`,
        type: "Daily Summary"
      };
    });
  }, []);

  const handleExport = async (report: any) => {
    setDownloadingId(report.id);
    
    try {
      // 1. Fetch the main dashboard data to get the list of commodities and global intelligence
      const dashRes = await fetch("http://127.0.0.1:8001/api/dashboard", { cache: 'no-store' });
      if (!dashRes.ok) throw new Error("Failed to fetch dashboard data");
      const dashData = await dashRes.json();

      // 2. Fetch detailed analysis for EACH commodity in the dashboard
      const commodityDetails = await Promise.all(
        dashData.commodities.map(async (c: any) => {
          try {
            const detRes = await fetch(`http://127.0.0.1:8001/api/commodity/${c.slug}`, { cache: 'no-store' });
            if (detRes.ok) return await detRes.json();
          } catch (e) {
            console.error(`Failed to fetch details for ${c.slug}`, e);
          }
          return null;
        })
      );

      const validDetails = commodityDetails.filter(d => d !== null);

      // 3. Generate Commodity Sections
      const commoditySections = validDetails.map((c, i) => {
        const scenario = c.scenario_analysis || {};
        const bull = scenario.bull || { label: "Bull", price_target: 0, rationale: "N/A" };
        const base = scenario.base || { label: "Base", price_target: 0, rationale: "N/A" };
        const bear = scenario.bear || { label: "Bear", price_target: 0, rationale: "N/A" };

        return `
          <div class="commodity-page" style="page-break-before: always; border-top: 1px solid #e2e8f0; padding-top: 40px; margin-top: 40px;">
            <div class="meta" style="color: #3b82f6;">SECTION 0${i + 2} | ${c.name.toUpperCase()} ANALYSIS</div>
            <h2 style="font-size: 24px; font-weight: 900; margin: 5px 0 10px 0; border: none; padding: 0;">${c.name}</h2>
            <div style="font-size: 14px; font-weight: 700; color: #64748b; margin-bottom: 30px;">
              Current Price: ${c.current_price} ${c.price_unit} | Trend: <span style="color: ${c.trend === 'up' ? '#10b981' : (c.trend === 'down' ? '#ef4444' : '#64748b')}">${c.trend.toUpperCase()}</span>
            </div>

            <!-- Executive Key Takeaways -->
            <div class="section">
              <div class="meta" style="color: #64748b; font-size: 10px;">Executive Key Takeaways</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px;">
                ${(c.key_takeaways || []).slice(0, 3).map((t: string, idx: number) => `
                  <div class="card" style="border-left: 3px solid #3b82f6;">
                    <div style="font-size: 14px; font-weight: 900; opacity: 0.2; margin-bottom: 2px;">0${idx + 1}</div>
                    <p style="font-size: 10px; margin: 0; font-weight: 500;">${t}</p>
                  </div>
                `).join('') || `
                  <div class="card" style="border-left: 3px solid #e2e8f0; grid-column: span 3;">
                    <p style="font-size: 10px; margin: 0; font-weight: 500; color: #94a3b8;">No specific takeaways recorded for this period.</p>
                  </div>
                `}
              </div>
            </div>

            <!-- Detailed Research Analysis -->
            <div class="section">
              <div class="meta" style="color: #64748b; font-size: 10px;">Detailed Research Analysis</div>
              <div style="margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <h3 style="font-size: 11px; text-transform: uppercase; color: #1e3a8a; margin: 0 0 5px 0;">Supply & Demand Dynamics</h3>
                <div style="font-size: 10px; margin-bottom: 15px;">
                  <p style="margin-bottom: 8px;">${typeof c.supply_demand === 'object' ? c.supply_demand.summary : (c.supply_demand_analysis || "Analysis pending.")}</p>
                  ${typeof c.supply_demand === 'object' ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-weight: 700;">
                      <div>Balance: <span style="font-weight: 400;">${c.supply_demand.market_balance}</span></div>
                      <div>Growth: <span style="font-weight: 400;">${c.supply_demand.demand_growth_yoy}</span></div>
                      <div>Inventory: <span style="font-weight: 400;">${c.supply_demand.global_inventory}</span></div>
                      <div>Utilization: <span style="font-weight: 400;">${c.supply_demand.production_capacity_utilization}</span></div>
                    </div>
                  ` : ''}
                </div>
                
                <h3 style="font-size: 11px; text-transform: uppercase; color: #1e3a8a; margin: 0 0 5px 0;">Geographic Risk Assessment</h3>
                <div style="font-size: 10px; margin: 0;">
                  <p style="margin-bottom: 8px;">${typeof c.geographic_intelligence === 'object' ? c.geographic_intelligence.summary : (c.geographic_intelligence || "No geographic risks identified.")}</p>
                  ${typeof c.geographic_intelligence === 'object' && c.geographic_intelligence.top_regions ? `
                    <ul style="margin: 0; padding-left: 15px;">
                      ${c.geographic_intelligence.top_regions.map((r: any) => `<li>${r.region}: ${r.share} (${r.status})</li>`).join('')}
                    </ul>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Strategic Risks & Opportunities -->
            <div class="section">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px;">
                <div style="border: 1px solid #fee2e2; border-radius: 8px; padding: 15px; background: rgba(239, 68, 68, 0.02);">
                  <div class="meta" style="color: #ef4444; font-size: 9px; margin-bottom: 8px;">Strategic Risks</div>
                  <ul style="margin: 0; padding-left: 15px; font-size: 10px; color: #475569;">
                    ${(c.risk_factors || []).map((risk: any) => `
                      <li style="margin-bottom: 8px;">
                        <div style="font-weight: 700; color: #b91c1c;">${typeof risk === 'object' ? risk.title : risk}</div>
                        ${typeof risk === 'object' ? `<div style="font-size: 9px; margin-top: 2px;">${risk.description}</div>` : ''}
                      </li>
                    `).join('') || '<li>No critical risks identified.</li>'}
                  </ul>
                </div>
                <div style="border: 1px solid #dcfce7; border-radius: 8px; padding: 15px; background: rgba(16, 185, 129, 0.02);">
                  <div class="meta" style="color: #10b981; font-size: 9px; margin-bottom: 8px;">Market Opportunities</div>
                  <ul style="margin: 0; padding-left: 15px; font-size: 10px; color: #475569;">
                    ${(c.opportunities || []).map((opp: any) => `
                      <li style="margin-bottom: 8px;">
                        <div style="font-weight: 700; color: #047857;">${typeof opp === 'object' ? opp.title : opp}</div>
                        ${typeof opp === 'object' ? `<div style="font-size: 9px; margin-top: 2px;">${opp.description}</div>` : ''}
                      </li>
                    `).join('') || '<li>No immediate opportunities identified.</li>'}
                  </ul>
                </div>
              </div>
            </div>

            <!-- Scenario Forecast Analysis -->
            <div class="section">
              <div class="meta" style="color: #64748b; font-size: 10px;">Scenario Forecast Analysis</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 10px;">
                <div class="card" style="border-top: 3px solid #10b981;">
                  <div style="font-size: 8px; font-weight: 800; color: #64748b; margin-bottom: 3px; text-transform: uppercase;">Bull Case</div>
                  <div style="font-size: 16px; font-weight: 900; color: #10b981;">${bull.price_target} ${c.price_unit}</div>
                  <p style="font-size: 9px; color: #64748b; margin: 3px 0 0 0;">${bull.rationale}</p>
                </div>
                <div class="card" style="border-top: 3px solid #3b82f6;">
                  <div style="font-size: 8px; font-weight: 800; color: #64748b; margin-bottom: 3px; text-transform: uppercase;">Base Case</div>
                  <div style="font-size: 16px; font-weight: 900; color: #3b82f6;">${base.price_target} ${c.price_unit}</div>
                  <p style="font-size: 9px; color: #64748b; margin: 3px 0 0 0;">${base.rationale}</p>
                </div>
                <div class="card" style="border-top: 3px solid #ef4444;">
                  <div style="font-size: 8px; font-weight: 800; color: #64748b; margin-bottom: 3px; text-transform: uppercase;">Bear Case</div>
                  <div style="font-size: 16px; font-weight: 900; color: #ef4444;">${bear.price_target} ${c.price_unit}</div>
                  <p style="font-size: 9px; color: #64748b; margin: 3px 0 0 0;">${bear.rationale}</p>
                </div>
              </div>
            </div>

            <!-- Strategic Procurement Advisory -->
            <div class="section">
              <div class="meta" style="color: #64748b; font-size: 10px;">Strategic Procurement Advisory</div>
              <div style="margin-top: 10px; border-left: 4px solid #1e3a8a; background: #f8fafc; padding: 15px; border-radius: 0 8px 8px 0;">
                <p style="font-size: 11px; font-weight: 700; color: #1e3a8a; margin: 0 0 5px 0; text-transform: uppercase;">Recommended Action Plan</p>
                <p style="font-size: 10px; margin: 0; line-height: 1.5; color: #1e293b;">${c.procurement_strategy || "Standard procurement protocols apply."}</p>
              </div>
            </div>

            <!-- Market Intelligence Feed -->
            <div class="section">
              <div class="meta" style="color: #64748b; font-size: 10px;">Related Market Intelligence</div>
              <div style="margin-top: 10px;">
                ${(c.related_intelligence || []).slice(0, 3).map((item: any) => `
                  <div style="border-left: 2px solid #e2e8f0; padding-left: 15px; position: relative; margin-bottom: 15px;">
                    <div style="position: absolute; left: -5px; top: 0; height: 8px; width: 8px; border-radius: 50%; background: #3b82f6;"></div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                      <span style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: ${item.classification === 'risk' ? '#ef4444' : (item.classification === 'opportunity' ? '#10b981' : '#3b82f6')}; background: ${item.classification === 'risk' ? 'rgba(239, 68, 68, 0.1)' : (item.classification === 'opportunity' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)')}; padding: 1px 4px; border-radius: 8px;">${item.classification}</span>
                      <span style="font-size: 8px; font-weight: 600; color: #94a3b8;">${new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 style="font-size: 11px; font-weight: 800; margin: 0 0 2px 0;">${item.title}</h4>
                    <p style="font-size: 9px; color: #475569; margin: 0;">${item.summary}</p>
                  </div>
                `).join('') || '<p style="font-size: 10px; color: #94a3b8;">No related events in this archive window.</p>'}
              </div>
            </div>

            <!-- Sources -->
            <div style="margin-top: 20px; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
              <span style="font-size: 8px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-right: 10px;">Intelligence Sources:</span>
              ${(c.sources || []).map((s: string) => `<span style="font-size: 8px; font-weight: 600; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin-right: 5px; text-transform: uppercase;">${s}</span>`).join('')}
            </div>
          </div>
        `;
      }).join('');

      // 4. Generate Global Intelligence Section
      const globalIntelligenceSection = `
        <div class="section" style="margin-top: 40px; page-break-before: always;">
          <div class="meta" style="color: #3b82f6;">SECTION 01 | EXECUTIVE GLOBAL FEED</div>
          <h2 style="font-size: 20px; font-weight: 900; margin-bottom: 20px; border: none; padding: 0;">Market Intelligence Summary</h2>
          <div class="card" style="margin-bottom: 30px; border-left: 4px solid #0f172a; background: #f1f5f9; padding: 20px;">
            <div class="meta" style="font-size: 9px; margin-bottom: 10px;">Strategic Outlook</div>
            <p style="font-size: 12px; font-weight: 500; margin: 0; line-height: 1.6;">${dashData.executive_summary}</p>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${(dashData.intelligence_feed || []).slice(0, 8).map((item: any) => `
              <div style="border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 10px;">
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 5px;">
                  <span style="font-size: 7px; font-weight: 900; text-transform: uppercase; padding: 2px 5px; border-radius: 4px; background: ${item.classification === 'risk' ? '#fee2e2' : (item.classification === 'opportunity' ? '#dcfce7' : '#f1f5f9')}; color: ${item.classification === 'risk' ? '#ef4444' : (item.classification === 'opportunity' ? '#10b981' : '#64748b')};">
                    ${item.classification}
                  </span>
                  <span style="font-size: 7px; color: #94a3b8; font-weight: 700;">${item.source}</span>
                </div>
                <h5 style="font-size: 10px; font-weight: 800; margin: 0 0 4px 0; color: #1e293b;">${item.title}</h5>
                <p style="font-size: 9px; color: #64748b; margin: 0; line-height: 1.4;">${item.summary}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const fullReportContent = `
        <html>
          <head>
            <title>${report.title}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
              body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; background: #fff; color: #1a1a1a; line-height: 1.4; max-width: 900px; margin: 0 auto; }
              .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
              h1 { color: #1e3a8a; margin: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
              .meta { color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; }
              h2 { color: #1e3a8a; font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 30px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
              .section { margin-bottom: 25px; }
              .card { border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; background: #f8fafc; }
              .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
              @media print { 
                body { padding: 0; } 
                .no-print { display: none; } 
                .commodity-page { page-break-before: always; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #0f172a; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                  <img src="http://localhost:3000/logo.png" alt="STL Logo" style="height: 32px; width: auto; filter: brightness(1.4) contrast(1.1);" />
                </div>
                <div>
                  <div class="meta">STL COMIQ | Terminal Briefing</div>
                  <h1>Intelligence Report: ${report.date}</h1>
                </div>
              </div>
              <div class="meta" style="text-align: right;">
                Generated: ${new Date().toLocaleString()}<br>
                Status: VALIDATED ARCHIVE
              </div>
            </div>

            ${globalIntelligenceSection}
            ${commoditySections}

            <div class="footer">
              <p style="font-weight: 800; color: #64748b; margin-bottom: 5px;">STRICTLY CONFIDENTIAL</p>
              This report is synthesized by the STL COMIQ Autonomous Intelligence Pipeline.<br>
              Data represents market conditions as of the report date and is for internal strategic planning only.
              <div class="no-print" style="margin-top: 20px; font-weight: bold; color: #3b82f6;">Press Ctrl+P to save this briefing as a PDF document.</div>
            </div>
          </body>
        </html>
      `.trim();

      const blob = new Blob([fullReportContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        alert("Pop-up blocked. Please allow pop-ups to view the report.");
      }
      
      console.log("Real multi-commodity report generated successfully.");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate report. Please ensure the backend is running at http://127.0.0.1:8001");
    } finally {
      setDownloadingId(null);
    }
  };


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
          <div className="flex items-center gap-2 text-primary/80 mb-4">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Validated Archives</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase">
            Daily Research Reports
          </h1>
          <p className="mt-4 text-muted-foreground/80 max-w-2xl font-medium">
            Access past daily summaries and deep-dive research packs synthesized by the STL COMIQ intelligence pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between border-border hover:bg-primary/5 transition-all group">
              <div className="flex items-center gap-6">
                <div className="rounded-xl bg-primary/10 p-4 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">PDF Archive</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{report.type}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{report.title}</h3>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {report.date}
                    </span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleExport(report)}
                disabled={downloadingId !== null}
                className="mt-4 md:mt-0 flex items-center justify-center gap-2 rounded-xl bg-secondary border border-border px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingId === report.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Intelligence
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
