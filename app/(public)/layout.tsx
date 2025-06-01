"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Briefcase, 
  Building2, 
  User, 
  LogIn,
  Search,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Find Jobs", href: "/jobs", icon: Search },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Browse by Location", href: "/jobs?view=map", icon: MapPin },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">
                  Colorado Trades Jobs
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-1 text-sm font-medium transition-colors hover:text-blue-600",
                      pathname === item.href
                        ? "text-blue-600"
                        : "text-gray-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {session ? (
                <>
                  {session.user.role === "employer" ? (
                    <Link href="/dashboard">
                      <Button variant="outline">
                        <Building2 className="mr-2 h-4 w-4" />
                        Employer Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/profile">
                      <Button variant="outline">
                        <User className="mr-2 h-4 w-4" />
                        My Applications
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post a Job
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col space-y-4 mt-6">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center space-x-2 text-base font-medium py-2",
                            pathname === item.href
                              ? "text-blue-600"
                              : "text-gray-700"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                    
                    <div className="border-t pt-4">
                      {session ? (
                        <>
                          {session.user.role === "employer" ? (
                            <Link
                              href="/dashboard"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button className="w-full" variant="outline">
                                <Building2 className="mr-2 h-4 w-4" />
                                Employer Dashboard
                              </Button>
                            </Link>
                          ) : (
                            <Link
                              href="/profile"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Button className="w-full" variant="outline">
                                <User className="mr-2 h-4 w-4" />
                                My Applications
                              </Button>
                            </Link>
                          )}
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Link
                            href="/auth/signin"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button className="w-full" variant="outline">
                              Sign In
                            </Button>
                          </Link>
                          <Link
                            href="/auth/signup"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button className="w-full">
                              Post a Job
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                For Job Seekers
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/jobs" className="text-gray-300 hover:text-white">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/companies" className="text-gray-300 hover:text-white">
                    Companies
                  </Link>
                </li>
                <li>
                  <Link href="/resources/resume-tips" className="text-gray-300 hover:text-white">
                    Resume Tips
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                For Employers
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/auth/signup" className="text-gray-300 hover:text-white">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/resources/hiring-guide" className="text-gray-300 hover:text-white">
                    Hiring Guide
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Resources
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-300 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-center text-gray-400">
              © 2024 Colorado Trades Jobs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}