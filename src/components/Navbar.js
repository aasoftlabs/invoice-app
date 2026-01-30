"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Logo from "./Logo";

export default function Navbar({ user, profile }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-40 m-auto py-2 flex justify-between items-center shadow-sm">
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
            Project Tracker
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

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
          >
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role || "Admin"}
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Avatar"
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

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                <div className="text-sm font-semibold">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.role}</div>
              </div>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>

              {user?.role === "admin" && (
                <>
                  <Link
                    href="/setup"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    <Settings className="w-4 h-4" /> Company Settings
                  </Link>
                  <Link
                    href="/users"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  >
                    <UserPlus className="w-4 h-4" /> Manage Users
                  </Link>
                </>
              )}

              <button
                onClick={() => signOut()}
                className="w-full text-left flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
