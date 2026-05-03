"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

interface UserNavProps {
  initialUserName?: string;
}

export function UserNav({ initialUserName = "User" }: UserNavProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>(initialUserName);

  useEffect(() => {
    // Also check cookie on mount in case it changed without a full refresh
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const name = getCookie("user_name");
    if (name) {
      setUserName(decodeURIComponent(name));
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-3 w-3 text-primary" />
        </div>
        <span className="text-xs font-bold text-foreground/80">{userName}</span>
      </div>
      <button 
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors group"
        title="Logout"
      >
        <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
