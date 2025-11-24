"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth';
import { ShopProvider } from '@/hooks/use-shop';
import { Header } from './header';
import { Footer } from './footer';
import { Toaster } from '@/components/ui/toaster';

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const pathname = usePathname();
  
  // Check if current path is dashboard or login
  const isDashboard = pathname?.startsWith('/dashboard');
  const isLogin = pathname?.startsWith('/login') || pathname?.startsWith('/signup');
  const hideHeaderFooter = isDashboard || isLogin;

  return (
    <AuthProvider>
      <ShopProvider>
        {hideHeaderFooter ? (
          // Dashboard/Login: No Header/Footer
          <>
            {children}
            <Toaster />
          </>
        ) : (
          // Public pages: With Header/Footer
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        )}
      </ShopProvider>
    </AuthProvider>
  );
}
