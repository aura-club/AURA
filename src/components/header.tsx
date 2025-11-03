"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

const navLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/resources", label: "Resources" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/alumni", label: "Alumni", memberOnly: true },
];

export function Header() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  // Helper function to check if user can see a link
  const canViewLink = (link: typeof navLinks[0]) => {
    if (!link.memberOnly) return true;
    return user && (user.role === 'member' || user.role === 'admin' || user.role === 'super_admin');
  };

  const NavLinksDesktop = () => (
    <nav className="hidden md:flex gap-6 items-center">
      {navLinks
        .filter(link => canViewLink(link))
        .map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-white/80",
              pathname.startsWith(link.href) ? "text-white" : "text-white/70"
            )}
          >
            {link.label}
          </Link>
        ))}
    </nav>
  );

  const NavLinksMobile = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background border-r-border/60">
        <nav className="grid gap-6 text-lg font-medium mt-10">
          <div className="mb-4">
            <Logo />
          </div>
          {navLinks
            .filter(link => canViewLink(link))
            .map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  pathname.startsWith(link.href) ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
        </nav>
      </SheetContent>
    </Sheet>
  );

  const AuthButton = () => {
    if (loading) return <Button variant="outline" disabled>Loading...</Button>;
    
    if (user) {
      const displayName = user.displayName || 'Member';
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} alt={displayName} />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard"><User className="mr-2 h-4 w-4" />Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
      <Button asChild variant="outline">
        <Link href="/login">Sign In</Link>
      </Button>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="flex-1 flex items-center justify-start">
          <Logo />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <NavLinksDesktop />
        </div>
        
        <div className="flex-1 flex items-center justify-end gap-4">
          <AuthButton />
          <NavLinksMobile />
        </div>
      </div>
    </header>
  );
}
