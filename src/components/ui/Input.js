"use client";

import { twMerge } from "tailwind-merge";

export function Input({ className, error, label, textarea, ...props }) {
  const Component = textarea ? "textarea" : "input";

  return (
    <div className="w-full">
      {label ? <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {label}
        </label> : null}
      <Component
        className={twMerge(
          "w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500",
          "text-gray-900 dark:text-white border-gray-300 dark:border-slate-600",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          textarea && "resize-y min-h-[100px]",
          error && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export function Select({ className, error, label, children, ...props }) {
  return (
    <div className="w-full">
      {label ? <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
          {label}
        </label> : null}
      <select
        className={twMerge(
          "w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all",
          "text-gray-900 dark:text-white border-gray-300 dark:border-slate-600",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          error && "border-red-500 focus:ring-red-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
