"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Loader from "@/components/common/Loader";
import SidebarLinkGroup from "@/components/Sidebar/SidebarLinkGroup";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  List,
  Plus
} from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (session?.user?.role === "jobseeker") {
      router.push("/profile");
    } else {
      setLoading(false);
    }
  }, [session, status, router]);

  if (loading || status === "loading") {
    return <Loader />;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* SIDEBAR HEADER */}
          <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">
                CTJ Employer
              </span>
            </Link>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              className="block lg:hidden"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            {/* Sidebar Menu */}
            <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
              {/* Menu Group */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  MENU
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {/* Dashboard */}
                  <li>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                        pathname === "/dashboard" && "bg-graydark dark:bg-meta-4"
                      )}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                  </li>

                  {/* Jobs */}
                  <SidebarLinkGroup
                    activeCondition={pathname.includes("/dashboard/jobs")}
                  >
                    {(handleClick, open) => {
                      return (
                        <>
                          <Link
                            href="#"
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                              pathname.includes("/dashboard/jobs") &&
                                "bg-graydark dark:bg-meta-4"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              handleClick();
                            }}
                          >
                            <Briefcase className="h-5 w-5" />
                            Job Postings
                            <svg
                              className={cn(
                                "absolute right-4 top-1/2 -translate-y-1/2 fill-current",
                                open && "rotate-180"
                              )}
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                                fill=""
                              />
                            </svg>
                          </Link>
                          {/* Dropdown Menu */}
                          <div
                            className={cn(
                              "translate transform overflow-hidden",
                              !open && "hidden"
                            )}
                          >
                            <ul className="mb-5.5 mt-4 flex flex-col gap-2.5 pl-6">
                              <li>
                                <Link
                                  href="/dashboard/jobs"
                                  className={cn(
                                    "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white",
                                    pathname === "/dashboard/jobs" &&
                                      "text-white"
                                  )}
                                >
                                  <List className="h-4 w-4" />
                                  All Jobs
                                </Link>
                              </li>
                              <li>
                                <Link
                                  href="/dashboard/jobs/create"
                                  className={cn(
                                    "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white",
                                    pathname === "/dashboard/jobs/create" &&
                                      "text-white"
                                  )}
                                >
                                  <Plus className="h-4 w-4" />
                                  Post New Job
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </>
                      );
                    }}
                  </SidebarLinkGroup>

                  {/* Applications */}
                  <li>
                    <Link
                      href="/dashboard/applications"
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                        pathname.includes("/dashboard/applications") &&
                          "bg-graydark dark:bg-meta-4"
                      )}
                    >
                      <FileText className="h-5 w-5" />
                      Applications
                    </Link>
                  </li>

                  {/* Company Profile */}
                  <li>
                    <Link
                      href="/dashboard/company"
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                        pathname === "/dashboard/company" &&
                          "bg-graydark dark:bg-meta-4"
                      )}
                    >
                      <Building2 className="h-5 w-5" />
                      Company Profile
                    </Link>
                  </li>

                  {/* Analytics */}
                  <li>
                    <Link
                      href="/dashboard/analytics"
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                        pathname === "/dashboard/analytics" &&
                          "bg-graydark dark:bg-meta-4"
                      )}
                    >
                      <BarChart3 className="h-5 w-5" />
                      Analytics
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Others Group */}
              <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  OTHERS
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {/* Settings */}
                  <li>
                    <Link
                      href="/dashboard/settings"
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4",
                        pathname.includes("/dashboard/settings") &&
                          "bg-graydark dark:bg-meta-4"
                      )}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* Header */}
          <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
            <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
              <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3 2xsm:gap-7">
                <ul className="flex items-center gap-2 2xsm:gap-4">
                  <span className="text-sm text-muted-foreground">
                    {session?.user?.company?.name || "Company"}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {session?.user?.company?.name?.charAt(0) || "C"}
                    </span>
                  </div>
                </ul>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}