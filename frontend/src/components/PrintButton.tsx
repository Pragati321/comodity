'use client';

import { FileText } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => {
        console.log("[DEBUG] Triggering print...");
        window.print();
      }}
      className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:bg-primary/20 transition-all active:scale-95 print:hidden"
    >
      <FileText className="h-4 w-4" />
      Download Intelligence Briefing
    </button>
  );
}
