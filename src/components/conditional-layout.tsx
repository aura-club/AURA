"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ReactNode } from "react";

export function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Check if current path is dashboard or login
  const isDashboard = pathname?.startsWith('/dashboard');
  const isLogin = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
  const hideHeaderFooter = isDashboard || isLogin;

  // If it's dashboard or login, render children without Header/Footer
  if (hideHeaderFooter) {
    return <>{children}</>;
  }

  // For all other pages (public pages), render with Header and Footer
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
