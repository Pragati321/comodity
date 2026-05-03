"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);

  const handleSync = async () => {
    if (status === "loading") return;
    
    setStatus("loading");
    setCurrentAgent("Starting...");

    try {
      const res = await fetch("https://commodity-backend-694682127859.asia-south2.run.app/api/pipeline/trigger", {
        method: "POST",
      });
      
      if (!res.ok) throw new Error("Sync trigger failed");
      
      // Polling for pipeline completion
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 100; // ~5 minutes max polling

      while (!isDone && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
          const statusRes = await fetch("https://commodity-backend-694682127859.asia-south2.run.app/api/pipeline/status");
          if (statusRes.ok) {
            const data = await statusRes.json();
            setCurrentAgent(data.current_agent || "Processing...");
            
            if (data.status === "completed") {
              isDone = true;
              setStatus("success");
            } else if (data.status === "failed") {
              throw new Error(data.error || "Pipeline execution failed");
            }
          }
        } catch (pollError) {
          console.warn("Polling error, retrying...", pollError);
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error("Sync timed out");
      }
      
      // Delay before reload to show success state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("Sync error:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={status === "loading"}
      className={cn(
        "flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] transition-all border",
        status === "idle" && "bg-secondary text-muted-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30",
        status === "loading" && "bg-primary/10 text-primary border-primary/30 cursor-wait",
        status === "success" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
        status === "error" && "bg-red-500/10 text-red-500 border-red-500/30"
      )}
    >
      {status === "loading" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      
      <span>
        {status === "idle" && "Sync Now"}
        {status === "loading" && (currentAgent || "Syncing...")}
        {status === "success" && "Updated"}
        {status === "error" && "Failed"}
      </span>
    </button>
  );
}
