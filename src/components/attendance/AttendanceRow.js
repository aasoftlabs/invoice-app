"use client";

import { Edit3, AlertTriangle, History, Loader2 } from "lucide-react";

export default function AttendanceRow({
  emp,
  date,
  yearlySummary,
  updatingId,
  onStatusChange,
  onRegularize,
  onViewHistory,
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const isFuture = date > todayStr;
  const isPast = date < todayStr;
  const dojStr = emp.joiningDate
    ? new Date(emp.joiningDate).toISOString().split("T")[0]
    : null;
  const isBeforeJoining = dojStr && date < dojStr;
  const isMissedOut =
    isPast && emp.attendance?.clockIn && !emp.attendance?.clockOut;
  const isDisabled = updatingId === emp._id || isBeforeJoining || isFuture;

  return (
    <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900 dark:text-white">
          {emp.name}
        </div>
        <div className="text-xs text-gray-500">
          {emp.employeeId || emp._id.slice(-6).toUpperCase()}
        </div>
        {isBeforeJoining ? (
          <div className="text-[10px] font-bold text-red-500 uppercase mt-1">
            Not Joined Yet
          </div>
        ) : isFuture ? (
          <div className="text-[10px] font-bold text-amber-500 uppercase mt-1">
            Future Date
          </div>
        ) : isMissedOut ? (
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase mt-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full w-fit">
            <AlertTriangle className="w-3 h-3" />
            Missed Exit
          </div>
        ) : null}
      </td>
      <td className="px-6 py-4">
        <select
          value={emp.attendance?.status || "absent"}
          onChange={(e) => onStatusChange(emp._id, e.target.value)}
          disabled={isDisabled}
          className={`text-xs font-bold uppercase rounded-lg border-none focus:ring-2 focus:ring-blue-500 px-3 py-1.5 cursor-pointer dark:bg-slate-900 ${isBeforeJoining || isFuture
            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
            : emp.attendance?.status === "present"
              ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              : emp.attendance?.status === "half_day"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                : emp.attendance?.status === "cl"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                  : emp.attendance?.status === "sl"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                    : emp.attendance?.status === "el"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400"
                      : emp.attendance?.status === "pl"
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400"
                        : emp.attendance?.status === "holiday"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
            }`}
        >
          <option
            value="present"
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          >
            Present
          </option>
          <option
            value="half_day"
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          >
            Half Day
          </option>
          {((yearlySummary[emp._id]?.cl || 0) < 12 ||
            emp.attendance?.status === "cl") && (
              <option
                value="cl"
                className="bg-white dark:bg-slate-900 text-orange-600 font-bold"
              >
                Casual Leave (CL)
              </option>
            )}
          {((yearlySummary[emp._id]?.sl || 0) < 12 ||
            emp.attendance?.status === "sl") && (
              <option
                value="sl"
                className="bg-white dark:bg-slate-900 text-rose-600 font-bold"
              >
                Sick Leave (SL)
              </option>
            )}
          {((yearlySummary[emp._id]?.el || 0) < 15 ||
            emp.attendance?.status === "el") && (
              <option
                value="el"
                className="bg-white dark:bg-slate-900 text-indigo-600 font-bold"
              >
                Earned Leave (EL)
              </option>
            )}
          <option
            value="pl"
            className="bg-white dark:bg-slate-900 text-teal-600 font-bold"
          >
            Paid Leave (PL)
          </option>
          <option
            value="holiday"
            className="bg-white dark:bg-slate-900 text-purple-600 font-bold"
          >
            Holiday
          </option>
          <option
            value="absent"
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          >
            Absent
          </option>
          <option
            value="lop"
            className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
          >
            LOP
          </option>
        </select>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          {emp.attendance?.clockIn
            ? new Date(emp.attendance.clockIn).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            : "--:--"}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          {emp.attendance?.clockOut
            ? new Date(emp.attendance.clockOut).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
            : "--:--"}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
          {(() => {
            if (!emp.attendance?.clockIn || !emp.attendance?.clockOut)
              return "--";
            const start = new Date(emp.attendance.clockIn);
            const end = new Date(emp.attendance.clockOut);
            const diffMs = end - start;
            if (diffMs < 0) return "--";
            const hrs = Math.floor(diffMs / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            return `${hrs}h ${mins}m`;
          })()}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col gap-1 items-center">
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="text-orange-600 dark:text-orange-400">
              CL: {yearlySummary[emp._id]?.cl || 0}/12
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              SL: {yearlySummary[emp._id]?.sl || 0}/12
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              EL: {yearlySummary[emp._id]?.el || 0}/15
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-xs text-gray-500 capitalize italic bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded">
          {emp.attendance?.source || "manual"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        {updatingId === emp._id ? (
          <Loader2 className="w-5 h-5 animate-spin ml-auto text-blue-500" />
        ) : (
          <div className="flex justify-end gap-2">
            {isMissedOut ? <button
              type="button"
              onClick={() => onRegularize(emp._id)}
              title="Regularize (Fix Exit Time)"
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button> : null}
            <button
              type="button"
              onClick={() => onViewHistory && onViewHistory(emp._id)}
              title="View History"
              className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-md transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
