"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { GitPullRequest, Users, UserCog, FolderKanban, Library, Calendar, Newspaper, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function AdminMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adminTab = searchParams.get("tab");

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Join Requests"
              isActive={
                pathname === "/dashboard/admin" &&
                (adminTab === "requests" || !adminTab)
              }
            >
              <Link href="/dashboard/admin?tab=requests">
                <GitPullRequest />
                Join Requests
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Members"
              isActive={
                pathname === "/dashboard/admin" && adminTab === "members"
              }
            >
              <Link href="/dashboard/admin?tab=members">
                <Users />
                Members
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Leadership"
              isActive={
                pathname === "/dashboard/admin" && adminTab === "leadership"
              }
            >
              <Link href="/dashboard/admin?tab=leadership">
                <UserCog />
                Leadership
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Alumni"
              isActive={
                pathname === "/dashboard/admin" && adminTab === "alumni"
              }
            >
              <Link href="/dashboard/admin?tab=alumni">
                <Users />
                Alumni
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Projects"
              isActive={
                pathname === "/dashboard/admin" && adminTab === "projects"
              }
            >
              <Link href="/dashboard/admin?tab=projects">
                <FolderKanban />
                Projects
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Resources"
              isActive={
                pathname === "/dashboard/admin" && adminTab === "resources"
              }
            >
              <Link href="/dashboard/admin?tab=resources">
                <Library />
                Resources
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Opportunities"
              isActive={
                pathname === "/dashboard/admin" && adminTab === "opportunities"
              }
            >
              <Link href="/dashboard/admin?tab=opportunities">
                <Calendar />
                Opportunities
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Blog Posts"
              isActive={pathname === "/dashboard/admin" && adminTab === "blog"}
            >
              <Link href="/dashboard/admin?tab=blog">
                <Newspaper />
                Blog Posts
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Shop Management"
              isActive={pathname === "/dashboard/shop"}
            >
              <Link href="/dashboard/shop">
                <ShoppingCart />
                Shop Management
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Delete Content"
              isActive={pathname === "/dashboard/admin/delete-content"}
            >
              <Link href="/dashboard/admin/delete-content">
                <Trash2 />
                Delete Content
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
