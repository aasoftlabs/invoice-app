"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileText, FileType, FolderKanban, CalendarCheck, DollarSign, Wallet } from "lucide-react";
import Logo from "./Logo";
import UserMenu from "@/components/navbar/UserMenu";
import { getUserPermissions } from "@/lib/permissions";

import { AnimatePresence, motion } from "framer-motion";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar({ user, profile }) {
  const pathname = usePathname();
  const permissions = getUserPermissions(user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/invoices", label: "Invoices", permission: "invoices", icon: FileText },
    { href: "/letterhead", label: "Letterhead", permission: "letterhead", icon: FileType },
    { href: "/project", label: "Project", permission: "project", icon: FolderKanban },
    { href: "/attendance", label: "Attendance", permission: null, icon: CalendarCheck },
    {
      href: "/payroll",
      label: "Payroll",
      permission: "payroll",
      icon: DollarSign,
      fallback: { href: "/payroll/my-slips", label: "My Slips", icon: DollarSign },
    },
    { href: "/accounts", label: "Accounts", permission: "accounts", icon: Wallet },
  ];

  const filteredLinks = user
    ? navLinks
      .map((link) => {
        if (!link.permission) return link;
        if (permissions.includes(link.permission)) return link;
        if (link.fallback) return link.fallback;
        return null;
      })
      .filter(Boolean)
    : [];

  return (
    <nav className="w-full bg-slate-50 dark:bg-slate-950 border-b border-gray-200 dark:border-white/5 shadow-sm print:hidden transition-colors relative z-50">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-linear-to-b from-blue-50/50 dark:from-blue-950/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 py-2 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button - Left Side */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo />
          </div>
        </div>


        <div className="hidden md:flex items-center gap-6">
          {filteredLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${isActive
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[22px] pb-[18px]"
                  : "text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Theme Toggle for Desktop */}
          <div className="border-l border-gray-200 dark:border-slate-700 pl-6 flex items-center">
            <ThemeToggle />
          </div>

          <UserMenu user={user} />
        </div>

        {/* Mobile User Menu - Right Side */}
        <div className="md:hidden">
          {user && <UserMenu user={user} />}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {filteredLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
