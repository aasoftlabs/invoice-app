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
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-40 m-auto py-2 flex justify-between items-center shadow-sm print:hidden transition-colors">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo />
        </div>
      </div>

      {/* Right: Navigation & User Menu */}
      <div className="flex items-center gap-6">
        {user &&
          (() => {
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

            if (permissions.includes("payroll")) {
              links.push({ href: "/payroll", label: "Payroll" });
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
          })()}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Menu */}
        <UserMenu user={user} />
      </div>
    </nav>
  );
}
