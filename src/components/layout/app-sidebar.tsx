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
  ChevronsUpDown,
  UserCog,
  ShieldCheck,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const activeRoleLabel = pathname.startsWith("/compliance-officer")
    ? "Compliance Officer"
    : "Admin User";

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="sm">
                  <div className="bg-muted flex aspect-square size-6 items-center justify-center rounded-full text-xs font-medium">
                    {activeRoleLabel === "Compliance Officer" ? "C" : "A"}
                  </div>
                  <span className="text-sm">{activeRoleLabel}</span>
                  <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    <span>Admin User</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/compliance-officer" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Compliance Officer</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
