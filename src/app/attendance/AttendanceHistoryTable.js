"use client";

import { CheckCircle2, XCircle, Clock, Info, History } from "lucide-react";

export default function AttendanceHistoryTable({ records, loading }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "present":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-semibold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            Present
          </span>
        );
      case "absent":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-semibold uppercase">
            <XCircle className="w-3 h-3" />
            Absent
          </span>
        );
      case "half_day":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-semibold uppercase">
            <Clock className="w-3 h-3" />
            Half Day
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded text-xs font-semibold uppercase">
            {status}
          </span>
        );
    }
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      weekday: "short",
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          Attendance History
        </h2>
        <div className="text-xs text-gray-500">Current Month</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-center">In</th>
              <th className="px-6 py-3 text-center">Out</th>
              <th className="px-6 py-3 text-center">Working Hours</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td
                    colSpan="6"
                    className="px-6 py-4 h-12 bg-gray-50/20 dark:bg-slate-800/20"
                  />
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <History className="w-8 h-8 text-gray-300" />
                    No attendance records found for this month
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr
                  key={rec._id}
                  className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(rec.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-slate-400 uppercase">
                    {formatTime(rec.clockIn)}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-slate-400 uppercase">
                    {formatTime(rec.clockOut)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                      {(() => {
                        if (!rec.clockIn || !rec.clockOut) return "--";
                        const start = new Date(rec.clockIn);
                        const end = new Date(rec.clockOut);
                        const diffMs = end - start;
                        if (diffMs < 0) return "--";
                        const hrs = Math.floor(diffMs / 3600000);
                        const mins = Math.floor((diffMs % 3600000) / 60000);
                        return `${hrs}h ${mins}m`;
                      })()}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(rec.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 border border-gray-200 dark:border-slate-600 rounded">
                      {rec.source}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
