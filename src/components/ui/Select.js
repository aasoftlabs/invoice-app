"use client";

import { twMerge } from "tailwind-merge";

export default function Select({
  className,
  error,
  label,
  options = [],
  children,
  placeholder,
  ...props
}) {
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
        {placeholder ? <option value="" disabled>
            {placeholder}
          </option> : null}
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
