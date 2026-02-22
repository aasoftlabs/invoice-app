"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, FileText, FileType, FolderKanban, CalendarCheck,
  DollarSign, Wallet, ChevronDown, List, BarChart2, TrendingUp,
  LayoutDashboard, ClipboardList, Settings, ListTodo, BookOpen,
  Users, History
} from "lucide-react";
import Logo from "./Logo";
import UserMenu from "@/components/navbar/UserMenu";
import { getUserPermissions } from "@/lib/permissions";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

// Dropdown wrapper — handles hover + click open/close
function NavDropdown({ label, isActive, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 text-sm font-semibold transition-colors ${isActive
          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 -mb-[22px] pb-[18px]"
          : "text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white"
          }`}
      >
        {label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
          >
            {/* Caret */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-gray-100 dark:border-slate-700 rotate-45" />
            <div className="py-1.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Single item inside a dropdown
function DropdownItem({ href, icon: Icon, label, isActive, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isActive
        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
        : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-white"
        }`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {label}
    </Link>
  );
}

function DropdownDivider({ label }) {
  return (
    <div className="px-4 pt-2 pb-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">
        {label}
      </span>
    </div>
  );
}

export default function Navbar({ user, profile }) {
  const pathname = usePathname();
  const permissions = getUserPermissions(user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = user?.role?.toLowerCase() === "admin" || permissions.includes("payroll");

  const navLinks = [
    { href: "/invoices", label: "Invoices", permission: "invoices", icon: FileText },
    { href: "/letterhead", label: "Letterhead", permission: "letterhead", icon: FileType },
    {
      label: "Project",
      permission: "project",
      href: "/project",
      icon: FolderKanban,
      dropdown: [
        { href: "/project", label: "Dashboard", icon: LayoutDashboard },
        { href: "/project/log", label: "Log Entry", icon: BookOpen },
        { href: "/project/tasks", label: "Tasks", icon: ListTodo },
        { href: "/project/projects", label: "Projects", icon: FolderKanban },
      ],
    },
    {
      label: "Attendance",
      permission: null,
      href: "/attendance",
      icon: CalendarCheck,
      ...(isAdmin ? {
        dropdown: [
          { href: "/attendance?tab=admin", label: "Dashboard", icon: Users },
          { href: "/attendance?tab=me", label: "My Attendance", icon: History },
        ]
      } : {})
    },
    {
      label: "Payroll",
      permission: "payroll",
      icon: DollarSign,
      href: "/payroll",  // base for isActive check
      dropdown: [
        { href: "/payroll", label: "Pay Slips", icon: FileText },
        { href: "/payroll/generate", label: "Generate Slips", icon: ClipboardList },
        { href: "/payroll/settings", label: "Settings", icon: Settings },
      ],
      fallback: {
        label: "Payroll",
        href: "/payroll/my-slips",
        icon: DollarSign,
        dropdown: [
          { href: "/payroll/my-slips", label: "My Slips", icon: FileText },
        ],
      },
    },
    {
      label: "Accounts",
      permission: "accounts",
      href: "/accounts",
      icon: Wallet,
      dropdown: [
        { href: "/accounts?tab=transactions", label: "Transactions", icon: List },
        { href: "/accounts?tab=balance-sheet", label: "Balance Sheet", icon: BarChart2 },
        { href: "/accounts?tab=pnl", label: "P&L Statement", icon: TrendingUp },
      ],
    },
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
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Logo />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {filteredLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);

            if (link.dropdown) {
              return (
                <NavDropdown key={link.href} label={link.label} isActive={isActive}>
                  {link.dropdown.map((item) => (
                    <DropdownItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={pathname === item.href.split("?")[0] && item.href.split("?")[0] !== "/" + link.href.split("/")[1]}
                    />
                  ))}
                </NavDropdown>
              );
            }

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

          {/* Theme Toggle */}
          <div className="border-l border-gray-200 dark:border-slate-700 pl-6 flex items-center">
            <ThemeToggle />
          </div>

          <UserMenu user={user} />
        </div>

        {/* Mobile User Menu */}
        <div className="md:hidden">
          {user && <UserMenu user={user} />}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);

                if (link.dropdown) {
                  return (
                    <div key={link.href}>
                      {/* Section header */}
                      <div className={`flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-widest ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"
                        }`}>
                        {Icon && <Icon className="w-4 h-4" />}
                        {link.label}
                      </div>
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 pl-10 pr-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href.split("?")[0]
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                            }`}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  );
                }

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
