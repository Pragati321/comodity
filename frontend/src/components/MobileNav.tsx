"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, LayoutDashboard, FileText, Settings, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

interface MobileNavProps {
  userName: string;
}

export function MobileNav({ userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  if (!mounted) return null;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Menu Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full max-w-[320px] h-full bg-[#05050a] border-l border-white/10 shadow-2xl p-8 pt-24 flex flex-col overflow-y-auto"
          >
            {/* Close Button Inside Menu */}
            <button 
              onClick={toggleMenu}
              className="absolute top-6 right-8 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="space-y-6 flex-1 mt-6">
              {[
                { href: "/", label: "Dashboard", icon: LayoutDashboard },
                { href: "/reports", label: "Reports", icon: FileText },
                { href: "/settings", label: "Settings", icon: Settings },
              ].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={toggleMenu}
                    className="flex items-center gap-5 text-lg font-bold text-white/90 hover:text-primary transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                      <link.icon className="h-6 w-6 text-white group-hover:text-white" />
                    </div>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-6 pb-8">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Appearance</span>
                <ThemeToggle />
              </div>
              
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white leading-tight">{userName}</div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Strategic Access</div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    document.cookie = "is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    window.location.href = "/login";
                  }}
                  className="w-full py-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden flex items-center">
      <button
        onClick={toggleMenu}
        className="p-2 text-foreground/80 hover:text-primary transition-colors z-[100]"
        aria-label="Toggle Menu"
      >
        <Menu className="h-7 w-7" />
      </button>

      {createPortal(menuContent, document.body)}
    </div>
  );
}
