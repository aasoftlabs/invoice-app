"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, ListTodo, FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";

export default function ProjectSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/project", icon: Home },
    { name: "Log Entry", href: "/project/log", icon: Calendar },
    { name: "Tasks", href: "/project/tasks", icon: ListTodo },
    { name: "Projects", href: "/project/projects", icon: FolderKanban },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 min-h-screen p-4 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header with Toggle Button */}
      <div className="mb-6">
        {!isCollapsed && (
          <>
            <h2 className="text-lg font-bold text-gray-800 px-3">Project Tracker</h2>
            <p className="text-xs text-gray-500 px-3 mt-1">Navigation</p>
          </>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`${isCollapsed ? 'mx-auto' : 'ml-auto'} mt-2 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-colors ${isActive
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
