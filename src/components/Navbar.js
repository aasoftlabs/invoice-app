"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import UserMenu from "@/components/navbar/UserMenu";
import { getUserPermissions } from "@/lib/permissions";

export default function Navbar({ user, profile }) {
  const pathname = usePathname();
  const permissions = getUserPermissions(user);
  return (
    <nav className="bg-white border-b border-gray-200 px-40 m-auto py-2 flex justify-between items-center shadow-sm print:hidden">
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
                      ? "text-blue-600 border-b-2 border-blue-600 -mb-[22px] pb-[18px]"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            });
          })()}

        {/* User Menu */}
        <UserMenu user={user} />
      </div>
    </nav>
  );
}
