"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  ListTodo,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ProjectSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const isAdmin = session?.user?.role?.toLowerCase() === "admin";
  const hasProjectPermission = session?.user?.permissions?.includes("project");

  const navItems = [
    { name: "Dashboard", href: "/project", icon: Home, adminOnly: true },
    {
      name: "Log Entry",
      href: "/project/log",
      icon: Calendar,
      adminOnly: false,
    },
    { name: "Tasks", href: "/project/tasks", icon: ListTodo, adminOnly: true },
    {
      name: "Projects",
      href: "/project/projects",
      icon: FolderKanban,
      adminOnly: true,
    },
  ].filter((item) => !item.adminOnly || isAdmin || hasProjectPermission);

  const effectivelyCollapsed = isCollapsed && !isHovered;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 min-h-screen p-4 transition-all duration-300 ease-in-out overflow-hidden flex-col hidden md:flex ${effectivelyCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Header with Toggle Button */}
      <div className="mb-6 flex items-start justify-between min-h-[48px] overflow-hidden">
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${effectivelyCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
        >
          <h2 className="text-lg font-bold text-gray-800 dark:text-white px-3 whitespace-nowrap">
            Project Tracker
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 px-3 mt-1 whitespace-nowrap">
            Navigation
          </p>
        </div>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex shrink-0 items-center justify-center ${effectivelyCollapsed ? "mx-auto" : ""}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center group relative ${effectivelyCollapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              title={effectivelyCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span
                className={`whitespace-nowrap transition-all duration-300 ease-in-out ${effectivelyCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"}`}
              >
                {!effectivelyCollapsed && item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
