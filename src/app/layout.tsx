import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { ClientProvider } from '@/components/client-provider';

export const metadata: Metadata = {
  title: 'AIREINO',
  description: 'The central hub for the Aerospace and Unmanned Research Association.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
      >
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
