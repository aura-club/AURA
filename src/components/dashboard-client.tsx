"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, LogOut, Settings, PlusCircle, History, ShieldAlert, ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, Suspense } from "react";
import { AdminMenu } from "@/components/admin-menu";
import { Logo } from "@/components/logo";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  }

  const displayName = user.displayName || 'User';
  const isAdmin = user.role === 'admin';
  const isSuperAdmin = user.role === 'super_admin';
  const canUpload = user.canUpload && !isAdmin && !isSuperAdmin;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="border-r border-border/40">
        {/* Sidebar Header with Logo */}
        <SidebarHeader className="border-b border-border/40 h-16 flex items-center px-4">
          <div className="flex items-center justify-between w-full">
            <Logo />
            <SidebarTrigger className="lg:hidden" />
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent className="overflow-y-auto">
          {/* User Navigation - For All Users */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Dashboard Home - Always visible for non-admins */}
                {!isAdmin && !isSuperAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/dashboard'}>
                      <Link href="/dashboard">
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                
                {/* My Orders - Available to all users */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="My Orders" isActive={pathname === '/dashboard/my-orders'}>
                    <Link href="/dashboard/my-orders">
                      <Package className="h-4 w-4" />
                      My Orders
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Member Navigation */}
          {(canUpload && !isAdmin && !isSuperAdmin) && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Add Content" isActive={pathname.startsWith('/dashboard/add')}>
                      <Link href="/dashboard/add">
                        <PlusCircle className="h-4 w-4" />
                        Add Content
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Submission History" isActive={pathname === '/dashboard/history'}>
                      <Link href="/dashboard/history">
                        <History className="h-4 w-4" />
                        History
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin Navigation - Dashboard */}
          {(isAdmin || isSuperAdmin) && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname === '/dashboard'}>
                      <Link href="/dashboard">
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Admin Menu Items - Below Dashboard */}
          {(isAdmin || isSuperAdmin) && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <Suspense fallback={<div className="px-2 py-1 text-xs text-muted-foreground">Loading...</div>}>
                    <AdminMenu />
                  </Suspense>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Super Admin Navigation */}
          {isSuperAdmin && (
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Manage Admins" isActive={pathname === '/dashboard/super-admin'}>
                      <Link href="/dashboard/super-admin">
                        <ShieldAlert className="h-4 w-4" />
                        Manage Admins
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Sidebar Footer */}
        <SidebarFooter className="border-t border-border/40 p-4 space-y-3">
          {/* View Public Site Button */}
          <Button asChild variant="outline" size="sm" className="w-full justify-start gap-2">
            <Link href="/">
              <ExternalLink className="h-4 w-4" />
              View Public Site
            </Link>
          </Button>

          {/* User Info Card */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/30">
            <Avatar className="h-9 w-9 border-2 border-border">
              <AvatarImage src={user.photoURL || undefined} alt={displayName} />
              <AvatarFallback className="text-xs font-semibold">{displayName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Settings and Logout */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/dashboard/settings'}>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                <LogOut className="h-4 w-4" />
                Logout
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content Area - FIXED OVERFLOW */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        {/* Mobile Header - Only visible on mobile */}
        <header className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-border/40 bg-background flex-shrink-0">
          <SidebarTrigger />
          <Logo />
          <div className="w-9" /> {/* Spacer for alignment */}
        </header>

        {/* Main Content - Single Scrollbar */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardClient({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
      <Toaster />
    </SidebarProvider>
  );
}
