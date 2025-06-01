"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Briefcase, Building2, User } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/jobs", label: "Find Jobs", icon: Briefcase },
    { href: "/companies", label: "Companies", icon: Building2 },
    { href: "/dashboard", label: "Employer Dashboard", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex flex-1 items-center justify-between">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Colorado Job Board
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname?.startsWith(item.href)
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/jobs">Post a Job</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container grid gap-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname?.startsWith(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <div className="grid gap-2 pt-2 border-t">
              <Button variant="outline" asChild className="w-full">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/jobs">Post a Job</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}