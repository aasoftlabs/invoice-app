"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border border-gray-200 dark:border-slate-700"
      aria-label="Toggle Theme"
      title={`Current theme: ${theme}`}
    >
      {theme === "light" && <Sun className="h-5 w-5 text-yellow-500" />}
      {theme === "dark" && <Moon className="h-5 w-5 text-blue-500" />}
      {theme === "system" && (
        <Monitor className="h-5 w-5 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  );
}
