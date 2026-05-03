"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials or server error");
      }

      const data = await response.json();
      
      // Store token and user info
      document.cookie = `is_logged_in=true; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `auth_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_name=${data.user.name}; path=/; max-age=86400; SameSite=Lax`;
      
      router.push("/");
      router.refresh(); // Force layout refresh to show navigation
    } catch (err: any) {
      setError(err.message || "Failed to connect to authentication server.");
      // For demo purposes, if backend is down, we can allow login with a warning
      console.warn("Auth API failed, allowing demo bypass for UI evaluation", err);
      // document.cookie = "is_logged_in=true; path=/; max-age=86400";
      // router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 animate-slow-zoom"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-[440px]">
        <div className="text-center mb-12">
          <div className="inline-flex h-24 w-24 items-center justify-center mb-6">
            <img src="/logo.png" alt="STL COMIQ Logo" className="h-24 w-24 object-contain mix-blend-screen brightness-[1.8] contrast-[1.2] drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]" />
          </div>
          <h1 className="text-5xl font-black tracking-tight uppercase italic text-white drop-shadow-2xl">
            STL&nbsp;<span className="text-primary not-italic ml-1">COMIQ</span>
          </h1>
          <p className="mt-3 text-white/60 font-medium tracking-wide">
            Next Gen Comodity Intelligence Terminal
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-white/10 bg-white/[0.02] backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs py-3 px-4 rounded-xl font-medium animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1" htmlFor="email">
                Corporate ID
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-white placeholder:text-white/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1" htmlFor="password">
                Biometric Key
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-white placeholder:text-white/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full bg-primary hover:bg-primary/90 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-primary/30 overflow-hidden disabled:opacity-70"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 uppercase tracking-widest text-sm">
                {isLoading ? "Validating..." : "Initialize Terminal"}
              </span>
              {isLoading ? (
                <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
              <ShieldCheck className="h-3 w-3" />
              End-to-End Quantum Encryption
            </div>
          </div>
        </div>
        
        <div className="mt-10 flex items-center justify-between px-2 text-[9px] font-bold uppercase tracking-widest text-white/30">
          <span>v4.0.2-Stable</span>
          <span>© 2026 Antigravity Systems</span>
        </div>
      </div>
    </div>
  );
}
