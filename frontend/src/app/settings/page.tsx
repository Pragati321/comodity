"use client";

import { Palette, LogOut, Box } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommodityManagement } from "@/components/CommodityManagement";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"appearance" | "commodities">("appearance");

  const handleLogout = () => {
    document.cookie = "is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-mesh selection:bg-primary/30">
      <div className="container mx-auto px-4 py-12 md:px-8 max-w-7xl">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-primary/80 mb-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">System Preferences</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-foreground uppercase">
            Terminal&nbsp;<span className="text-primary not-italic">Settings</span>
          </h1>
          <p className="mt-4 text-muted-foreground font-medium max-w-2xl">
            Configure your intelligence display preferences and manage the strategic commodity catalog for the reporting engine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Navigation */}
          <div className="lg:col-span-3 space-y-2">
            <button 
              onClick={() => setActiveTab("appearance")}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all border ${
                activeTab === "appearance" 
                  ? "bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5" 
                  : "hover:bg-secondary text-muted-foreground border-transparent"
              }`}
            >
              <Palette className="h-4 w-4" />
              Appearance
            </button>

            <button 
              onClick={() => setActiveTab("commodities")}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all border ${
                activeTab === "commodities" 
                  ? "bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5" 
                  : "hover:bg-secondary text-muted-foreground border-transparent"
              }`}
            >
              <Box className="h-4 w-4" />
              Commodities
            </button>

            <div className="pt-6 mt-6 border-t border-border/50">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-red-500/10 text-red-500 font-bold transition-all border border-transparent hover:border-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-9">
            {activeTab === "appearance" ? (
              <div className="glass-card rounded-[2rem] p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-10">
                  <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <Palette className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                      Display Options
                    </h2>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Interface Customization</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/30 border border-border/50 backdrop-blur-sm group hover:border-primary/30 transition-all">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">Theme Preference</h3>
                      <p className="text-sm text-muted-foreground mt-1">Switch between high-contrast dark terminal and professional light mode.</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-[2rem] p-8 md:p-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <CommodityManagement />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

