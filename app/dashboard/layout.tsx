"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase,
  },
  {
    title: "Applications",
    href: "/dashboard/applications",
    icon: FileText,
  },
  {
    title: "Company",
    href: "/dashboard/company",
    icon: Building2,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col border-r">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Briefcase className="h-6 w-6" />
              <span>Employer Portal</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t p-3">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-muted-foreground">
              ABC Construction
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">AC</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}