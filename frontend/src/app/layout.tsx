import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/UserNav";
import { MobileNav } from "@/components/MobileNav";
import Link from "next/link";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "STL COMIQ | Enterprise Dashboard",
  description: "CXO-grade decision intelligence for optical fibre manufacturing supply chain.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("is_logged_in");
  const userName = cookieStore.get("user_name")?.value || "Demo Executive";
  const showNav = isLoggedIn?.value === "true";
  const decodedUserName = decodeURIComponent(userName);

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          {/* Header only shown if logged in */}
          {showNav && (
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center px-4 md:px-8">
                <div className="mr-4 flex">
                  <Link className="mr-6 flex items-center space-x-2" href="/">
                    <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                    <span className="text-xl font-black italic tracking-tight text-foreground">
                      STL&nbsp;<span className="text-primary not-italic ml-0.5">COMIQ</span>
                    </span>
                  </Link>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-4">
                  {/* Desktop Navigation */}
                  <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link className="transition-colors hover:text-primary" href="/">Dashboard</Link>
                    <Link className="transition-colors hover:text-primary text-muted-foreground" href="/reports">Reports</Link>
                    <Link className="transition-colors hover:text-primary text-muted-foreground" href="/settings">Settings</Link>
                  </nav>
                  
                  {/* Desktop Actions */}
                  <div className="hidden md:flex items-center gap-4 border-l border-border pl-4">
                    <UserNav initialUserName={decodedUserName} />
                    <ThemeToggle />
                  </div>

                  {/* Mobile Navigation */}
                  <MobileNav userName={decodedUserName} />
                </div>
              </div>
            </header>
          )}
          
          <main className="flex-1">
            {children}
          </main>

          {showNav && (
            <footer className="border-t border-border py-6 md:px-8 md:py-0">
              <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built for Sterlite Technologies (STL) Strategic Intelligence. © 2026 Antigravity Systems.
                </p>
              </div>
            </footer>
          )}
        </div>
      </body>
    </html>
  );
}
