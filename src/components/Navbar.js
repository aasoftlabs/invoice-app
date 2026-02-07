"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import UserMenu from "@/components/navbar/UserMenu";
import { getUserPermissions } from "@/lib/permissions";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar({ user, profile }) {
  const pathname = usePathname();
  const permissions = getUserPermissions(user);
  return (
    <nav className="w-full bg-slate-50 dark:bg-slate-950 border-b border-gray-200 dark:border-white/5 shadow-sm print:hidden transition-colors relative">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 dark:from-blue-950/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo />
          </div>
        </div>

        {/* Right: Navigation & User Menu */}
        <div className="flex items-center gap-6">
          {user ? (() => {
              const links = [];

              if (permissions.includes("invoices")) {
                links.push({ href: "/invoices", label: "Invoices" });
              }
              if (permissions.includes("letterhead")) {
                links.push({ href: "/letterhead", label: "Letterhead" });
              }
              if (permissions.includes("project")) {
                links.push({ href: "/project", label: "Project" });
              }

              links.push({ href: "/attendance", label: "Attendance" });

              if (permissions.includes("payroll")) {
                links.push({ href: "/payroll", label: "Payroll" });
              } else {
                links.push({ href: "/payroll/my-slips", label: "My Slips" });
              }

              if (permissions.includes("accounts")) {
                links.push({ href: "/accounts", label: "Accounts" });
              }

              return links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`hidden md:block text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[22px] pb-[18px]"
                        : "text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              });
            })() : null}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <UserMenu user={user} />
        </div>
      </div>
    </nav>
  );
}
