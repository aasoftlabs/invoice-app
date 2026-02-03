"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-md transition-all flex items-center justify-center min-w-[32px] h-8 border shadow-sm ${
      isActive
        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-semibold"
        : "bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
    } ${className}`}
  >
    {children}
  </button>
);

export const ToolbarDropdown = ({
  value,
  options,
  onChange,
  icon: Icon,
  placeholder,
  width = "w-24",
  contentWidth,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedLabel =
    options.find((o) => o.value == value)?.label || placeholder || value;

  return (
    <div className={`relative h-8 ${width} ${className}`} ref={wrapperRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex items-center justify-between px-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-xs font-medium text-gray-700 dark:text-slate-200 transition-all gap-1 cursor-pointer focus:ring-1 focus:ring-blue-500"
        title={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
      >
        {Icon ? (
          <div className="flex items-center justify-center w-full">
            <Icon className="w-4 h-4 text-gray-600 dark:text-slate-400" />
          </div>
        ) : (
          <>
            <span className="truncate grow text-left">{selectedLabel}</span>
            <ChevronDown
              className={`w-3 h-3 text-gray-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 ${contentWidth || "w-max min-w-full"} bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto flex flex-col`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs whitespace-nowrap hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-between ${
                value === opt.value
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-slate-200"
              }`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
