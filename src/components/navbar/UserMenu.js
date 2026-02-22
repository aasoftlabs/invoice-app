"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  UserPlus,
  StickyNote,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { ThemeToggle } from "../ThemeToggle";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";

export default function UserMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
        >
          <div className="text-right hidden md:block">
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-gray-500 dark:text-slate-400 capitalize">
              {user?.designation || user?.role}
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden border border-gray-300 dark:border-slate-600">
            {user?.image ? (
              <Image
                src={user.image}
                alt="Avatar"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Desktop Dropdown */}
        {isOpen ? (
          <div className="hidden md:block absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">


            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" /> My Profile
            </Link>

            <Link
              href="/notes"
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              <StickyNote className="w-4 h-4" /> My Notes
            </Link>

            {user?.permissions?.includes("company") ? (
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" /> Company Settings
              </Link>
            ) : null}

            {user?.permissions?.includes("users") ? (
              <Link
                href="/users"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setIsOpen(false)}
              >
                <UserPlus className="w-4 h-4" /> Manage Users
              </Link>
            ) : null}

            <button
              onClick={() => signOut()}
              className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-slate-700"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        ) : null}
      </div>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed left-0 right-0 top-[73px] border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden z-40 shadow-lg"
          >
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-2">
                <div>
                  <div className="text-sm font-semibold dark:text-white">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                    {user?.role}
                  </div>
                </div>
                <ThemeToggle />
              </div>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>

              <Link
                href="/notes"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <StickyNote className="w-4 h-4" /> My Notes
              </Link>

              {user?.permissions?.includes("company") ? (
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4" /> Company Settings
                </Link>
              ) : null}

              {user?.permissions?.includes("users") ? (
                <Link
                  href="/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <UserPlus className="w-4 h-4" /> Manage Users
                </Link>
              ) : null}

              <button
                onClick={() => signOut()}
                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-slate-700 mt-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ThemeLabel() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (theme === "dark") return "Dark Mode";
  if (theme === "light") return "Light Mode";
  return "System Mode";
}
