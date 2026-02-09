"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  History,
  Calendar,
  Trash2,
} from "lucide-react";

export default function AttendanceHistoryTable({ records, loading, onDelete }) {
  const getStatusBadge = (rec) => {
    switch (rec.status) {
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
      case "holiday":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-semibold uppercase">
            <Calendar className="w-3 h-3" />
            Holiday: {rec.note || "Public Holiday"}
          </span>
        );
      case "cl":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs font-semibold uppercase">
            <Info className="w-3 h-3" />
            Casual Leave
          </span>
        );
      case "sl":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-xs font-semibold uppercase">
            <Info className="w-3 h-3" />
            Sick Leave
          </span>
        );
      case "el":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs font-semibold uppercase">
            <Info className="w-3 h-3" />
            Earned Leave
          </span>
        );
      case "pl":
        return (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded text-xs font-semibold uppercase">
            <Info className="w-3 h-3" />
            Paid Leave
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 rounded text-xs font-semibold uppercase">
            {status.replace("_", " ")}
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

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-center">In</th>
              <th className="px-6 py-3 text-center">Out</th>
              <th className="px-6 py-3 text-center">Working Hours</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3 text-right">Actions</th>
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
                  <td className="px-6 py-4">{getStatusBadge(rec)}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 capitalize px-2 py-0.5 border border-gray-200 dark:border-slate-600 rounded">
                      {rec.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          const dateStr = new Date(rec.date).toISOString().split('T')[0];
                          if (window.confirm('Delete this attendance record?')) {
                            onDelete(dateStr);
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 animate-pulse space-y-3">
              <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
              <div className="h-8 bg-gray-50 dark:bg-slate-800 rounded shadow-sm" />
            </div>
          ))
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No records found</div>
        ) : (
          records.map((rec) => (
            <div key={rec._id} className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-gray-900 dark:text-white">
                  {formatDate(rec.date)}
                </div>
                <div>{getStatusBadge(rec)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">
                    In
                  </div>
                  <div className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {formatTime(rec.clockIn)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">
                    Out
                  </div>
                  <div className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    {formatTime(rec.clockOut)}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                  <div className="text-[10px] text-blue-400 uppercase font-bold">
                    Hrs
                  </div>
                  <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
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
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-medium px-2 py-0.5 border border-gray-100 dark:border-slate-700 rounded bg-gray-50/50 dark:bg-slate-800/50">
                  Source: {rec.source}
                </span>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      const dateStr = new Date(rec.date).toISOString().split('T')[0];
                      if (window.confirm('Delete this attendance record?')) {
                        onDelete(dateStr);
                      }
                    }}
                    className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
