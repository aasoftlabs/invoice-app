"use client";

import { twMerge } from "tailwind-merge";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={twMerge(
        "bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
