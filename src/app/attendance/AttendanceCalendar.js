"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

export default function AttendanceCalendar({ records, minimal = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Actual days
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = new Date(year, month, i).toISOString().split("T")[0];
    const record = records.find((r) => r.date.startsWith(dateStr));
    days.push({ day: i, record });
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800";
      case "half_day":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "absent":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800";
      case "lop":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "cl":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      case "sl":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "el":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "pl":
        return "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400 border-teal-200 dark:border-teal-800";
      case "holiday":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      default:
        return "bg-gray-50 dark:bg-slate-900/50 text-gray-400 border-gray-100 dark:border-slate-800";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center justify-between ${minimal ? "mb-2" : "mb-4"}`}
      >
        <h3
          className={`${minimal ? "text-xs" : "font-semibold"} text-gray-900 dark:text-white`}
        >
          {currentDate.toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500"
          >
            <ChevronLeft className={`${minimal ? "w-3 h-3" : "w-4 h-4"}`} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors text-gray-500"
          >
            <ChevronRight className={`${minimal ? "w-3 h-3" : "w-4 h-4"}`} />
          </button>
        </div>
      </div>

      <div
        className={`grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-gray-400 ${minimal ? "mb-0.5" : "mb-1"} uppercase tracking-wider`}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div
        className={`grid grid-cols-7 ${minimal ? "gap-0.5" : "gap-1"} flex-1`}
      >
        {days.map((d, i) => (
          <div
            key={i}
            className={`aspect-square flex flex-col items-center justify-center rounded-md border ${minimal ? "text-[10px]" : "text-xs"} transition-all ${
              d === null
                ? "border-transparent"
                : d.record
                  ? getStatusColor(d.record.status)
                  : "bg-gray-50 dark:bg-slate-900/50 text-gray-400 border-gray-100 dark:border-slate-800"
            }`}
          >
            {d && (
              <>
                <span className="font-medium">{d.day}</span>
                {d.record && (
                  <div className={`${minimal ? "mt-0" : "mt-0.5"}`}>
                    {d.record.status === "present" && (
                      <div
                        className={`${minimal ? "w-0.5 h-0.5" : "w-1 h-1"} rounded-full bg-current`}
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div
        className={`${minimal ? "mt-2" : "mt-4"} flex flex-wrap gap-2 text-[9px] text-gray-500 justify-center`}
      >
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Pre
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Half
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Abs
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> LOP
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> CL
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> SL
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> EL
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500" /> PL
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Holiday
        </div>
      </div>
    </div>
  );
}
