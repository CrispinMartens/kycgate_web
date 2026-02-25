"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck,
  Settings,
  GitBranch,
  ShieldAlert,
  Radar,
  ClipboardCheck,
  ListTree,
  ArrowLeftRight,
  Palette,
  Code2,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

const navGroups = [
  {
    label: "Dashboard",
    items: [
      { title: "Overview", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Entities", href: "/entities", icon: Building2 },
      { title: "Individuals", href: "/individuals", icon: Users },
      { title: "Applications", href: "/applications", icon: FileCheck },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Configure", href: "/configure", icon: Settings },
      { title: "KYC Workflows", href: "/kyc-workflows", icon: GitBranch },
      { title: "Risk Scoring", href: "/risk-scoring", icon: ShieldAlert },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { title: "Risk Monitoring", href: "/risk-monitoring", icon: Radar },
      { title: "ODD", href: "/odd", icon: ClipboardCheck },
    ],
  },
  {
    label: "Data",
    items: [
      { title: "Properties", href: "/properties", icon: ListTree },
      { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Themes", href: "/themes", icon: Palette },
      { title: "Developer Tools", href: "/developer-tools", icon: Code2 },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">KYCGate</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Compliance Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="sm">
              <div className="bg-muted flex aspect-square size-6 items-center justify-center rounded-full text-xs font-medium">
                A
              </div>
              <span className="text-sm">Admin User</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
