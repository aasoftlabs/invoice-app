"use client";

import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

/**
 * Reusable Button component
 * @param {string} variant - primary, secondary, danger, ghost, outline
 * @param {string} size - sm, md, lg
 * @param {boolean} isLoading - Shows loading spinner
 * @param {React.ReactNode} icon - Icon component
 */
export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  icon: Icon,
  type = "button",
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-500/20 focus:ring-blue-500",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white focus:ring-gray-500",
    danger:
      "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/20 focus:ring-red-500",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300",
    outline:
      "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : Icon ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      {children}
    </button>
  );
}
