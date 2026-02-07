"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle2,
  MapPin,
} from "lucide-react";

export default function AttendancePunchCard({
  record,
  onPunch,
  loading,
  minimal = false,
}) {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    if (!date) return "--:--";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isClockedIn = record && record.clockIn && !record.clockOut;
  const isFinished = record && record.clockOut;

  return (
    <div
      className={
        minimal
          ? ""
          : "bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700"
      }
    >
      {!minimal && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Today&apos;s Activity
          </h2>
          <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
            {mounted
              ? now.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "-- --- ----"}
          </div>
        </div>
      )}

      <div className={`text-center ${minimal ? "py-2" : "py-6"}`}>
        <div
          className={`${minimal ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"} font-mono font-bold text-gray-900 dark:text-white mb-1 transition-all`}
        >
          {mounted
            ? now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
            : "--:--:-- --"}
        </div>
        <div className="text-[9px] sm:text-[10px] text-gray-500 mb-4 lowercase italic tracking-wider">
          current system time
        </div>

        <div
          className={`grid grid-cols-2 gap-2 sm:gap-3 ${minimal ? "mb-4" : "mb-8"}`}
        >
          <div
            className={`${minimal ? "p-2 sm:p-3" : "p-3 sm:p-4"} bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700`}
          >
            <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold mb-0.5">
              Clock In
            </div>
            <div
              className={`${minimal ? "text-xs sm:text-sm" : "text-base sm:text-lg"} font-bold text-gray-900 dark:text-white`}
            >
              {formatTime(record?.clockIn)}
            </div>
          </div>
          <div
            className={`${minimal ? "p-2 sm:p-3" : "p-3 sm:p-4"} bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700`}
          >
            <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-bold mb-0.5">
              Clock Out
            </div>
            <div
              className={`${minimal ? "text-xs sm:text-sm" : "text-base sm:text-lg"} font-bold text-gray-900 dark:text-white`}
            >
              {formatTime(record?.clockOut)}
            </div>
          </div>
        </div>

        <button
          onClick={onPunch}
          disabled={loading}
          className={`w-full ${minimal ? "py-2.5 sm:py-3 text-sm sm:text-base" : "py-3.5 sm:py-4 text-base sm:text-lg"} rounded-xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer ${
            isFinished
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 cursor-default"
              : isClockedIn
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-200 dark:shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none"
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isFinished ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Completed for Today
            </>
          ) : isClockedIn ? (
            <>
              <LogOut className="w-5 h-5" />
              Punch Out
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Punch In
            </>
          )}
        </button>
      </div>

      {!minimal && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Your location and system timestamps are recorded for attendance
            verification.
          </p>
        </div>
      )}
    </div>
  );
}
