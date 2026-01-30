"use client";

import Link from "next/link";
import Logo from "./Logo";
import UserMenu from "@/components/navbar/UserMenu";

export default function Navbar({ user, profile }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-40 m-auto py-2 flex justify-between items-center shadow-sm print:hidden">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo />
        </div>
      </div>

      {/* Right: Navigation & User Menu */}
      <div className="flex items-center gap-6">
        {user && (
          <Link
            href="/invoices"
            className="hidden md:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Invoices
          </Link>
        )}

        {user && (
          <Link
            href="/letterhead"
            className="hidden md:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Letterhead
          </Link>
        )}

        {user && (
          <Link
            href="/project"
            className="hidden md:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Project
          </Link>
        )}

           {user &&
          (user.role === "admin" || user.permissions?.includes("payroll")) && (
            <Link
              href="/payroll"
              className="hidden md:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
            >
              Payroll
            </Link>
          )}

        {user &&
          (user.role === "admin" || user.permissions?.includes("accounts")) && (
            <Link
              href="/accounts"
              className="hidden md:block text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
            >
              Accounts
            </Link>
          )}

     

        {/* User Menu */}
        <UserMenu user={user} />
      </div>
    </nav>
  );
}
