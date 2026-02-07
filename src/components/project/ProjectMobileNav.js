"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, ListTodo, FolderKanban } from "lucide-react";

export default function ProjectMobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role?.toLowerCase() === "admin";
  const hasProjectPermission = session?.user?.permissions?.includes("project");

  const navItems = [
    { name: "Dashboard", href: "/project", icon: Home, adminOnly: true },
    { name: "Log", href: "/project/log", icon: Calendar, adminOnly: false },
    { name: "Tasks", href: "/project/tasks", icon: ListTodo, adminOnly: true },
    {
      name: "Projects",
      href: "/project/projects",
      icon: FolderKanban,
      adminOnly: true,
    },
  ].filter((item) => !item.adminOnly || isAdmin || hasProjectPermission);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-6 py-1.5 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <nav className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center p-2 rounded-xl transition-all active:scale-90 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-2.5 rounded-xl transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
              >
                <Icon className="w-6 h-6 shrink-0" />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
