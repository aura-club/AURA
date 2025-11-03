"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const navLinks = [
  { href: "/opportunities/events", label: "Events" },
  { href: "/opportunities/sessions", label: "Club Sessions" },
  { href: "/opportunities/external", label: "External" },
];

export default function OpportunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Find the current active tab. It could be one of the base paths or a sub-path.
  const activeTab = navLinks.find(link => pathname.startsWith(link.href))?.href || navLinks[0].href;
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Opportunities</h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Find upcoming events, club sessions, and external opportunities to get involved.
        </p>
      </div>

      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-primary/20">
          {navLinks.map((link) => (
            <TabsTrigger key={link.href} value={link.href} asChild>
              <Link href={link.href}>{link.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {children}
      </Tabs>
    </div>
  );
}
