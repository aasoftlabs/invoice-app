"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar as CalendarIcon,
  Download,
  Edit3,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  History,
} from "lucide-react";
import AccessDenied from "@/components/ui/AccessDenied";
import ConfirmModal from "@/components/ui/ConfirmModal";
import InputModal from "@/components/ui/InputModal";

export default function AttendanceAdminGrid({ onViewHistory }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updating, setUpdating] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [yearlySummary, setYearlySummary] = useState({});

  // Modal State
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
    title: "",
    label: "",
    defaultValue: "",
    placeholder: "",
  });

  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    type: null,
    data: null,
    title: "",
    message: "",
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setUnauthorized(false);
      const res = await fetch(`/api/attendance/admin?date=${date}`);

      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEmployees(data);

      // Also fetch yearly summary for usage column
      const yrRes = await fetch(
        `/api/attendance/summary?year=${new Date(date).getFullYear()}`,
      );
      const yrData = await yrRes.json();
      if (yrData.success) {
        setYearlySummary(yrData.summary);
      }
    } catch (error) {
      console.error("Error fetching admin attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const handleUpdateStatus = async (userId, status, overrides = {}) => {
    try {
      setUpdating(userId);
      const res = await fetch("/api/attendance/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          date,
          status,
          clockIn: overrides.clockIn,
          clockOut: overrides.clockOut,
          note: overrides.note,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp._id === userId) {
            return {
              ...emp,
              attendance: { ...emp.attendance, status, source: "admin" },
            };
          }
          return emp;
        }),
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const adjustDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  const markHolidayForAll = async (note) => {
    try {
      setLoading(true);
      const promises = filteredEmployees.map((emp) =>
        fetch("/api/attendance/admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: emp._id,
            date,
            status: "holiday",
            note,
          }),
        }),
      );

      await Promise.all(promises);
      fetchAttendance();
    } catch (error) {
      alert("Failed to mark holidays: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openMarkHolidayAllModal = () => {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) {
      // Sunday
      setConfirmModalState({
        isOpen: true,
        type: "sunday_holiday",
        title: "Mark Sunday Holiday",
        message: "It is Sunday. Mark as 'Weekly Off' for all employees?",
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: "holiday_all",
      title: "Mark Holiday for All",
      label: "Enter Holiday Name (e.g. Republic Day):",
      defaultValue: "Public Holiday",
    });
  };

  const openMarkHolidaySingleModal = (empId) => {
    const dayOfWeek = new Date(date).getDay();
    if (dayOfWeek === 0) {
      // Sunday
      setConfirmModalState({
        isOpen: true,
        type: "sunday_single_holiday",
        data: { empId },
        title: "Mark Sunday Holiday",
        message: "It is Sunday. Mark as 'Weekly Off' for this employee?",
      });
      return;
    }

    setModalState({
      isOpen: true,
      type: "holiday_single",
      data: { empId },
      title: "Mark Holiday",
      label: "Enter Holiday Name:",
      defaultValue: "Public Holiday",
    });
  };

  const openRegularizeModal = (empId) => {
    setModalState({
      isOpen: true,
      type: "regularize",
      data: { empId },
      title: "Regularize Attendance",
      label: "Enter exit time (24h format HH:mm):",
      defaultValue: "18:00",
      placeholder: "HH:mm",
    });
  };

  const handleModalSubmit = async (value) => {
    if (!value) return;

    if (modalState.type === "holiday_all") {
      setConfirmModalState({
        isOpen: true,
        type: "bulk_holiday",
        data: { name: value },
        title: "Confirm Bulk Holiday",
        message: `Are you sure you want to mark ${date} as a holiday for ALL employees?`,
      });
    } else if (modalState.type === "holiday_single") {
      handleUpdateStatus(modalState.data.empId, "holiday", { note: value });
    } else if (modalState.type === "regularize") {
      const exitTime = value;
      if (exitTime && /^([01]\d|2[0-3]):([0-5]\d)$/.test(exitTime)) {
        const emp = employees.find((e) => e._id === modalState.data.empId);
        handleUpdateStatus(
          modalState.data.empId,
          emp?.attendance?.status || "present",
          { clockOut: exitTime },
        );
      } else {
        alert("Invalid time format. Please use HH:mm (e.g. 18:00)");
      }
    }
  };

  const handleConfirm = async () => {
    if (confirmModalState.type === "sunday_holiday") {
      await markHolidayForAll("Weekly Off");
    } else if (confirmModalState.type === "bulk_holiday") {
      await markHolidayForAll(confirmModalState.data.name);
    } else if (confirmModalState.type === "sunday_single_holiday") {
      handleUpdateStatus(confirmModalState.data.empId, "holiday", {
        note: "Weekly Off",
      });
    }
  };

  if (unauthorized) {
    return (
      <AccessDenied message="You no longer have permission to view the attendance dashboard." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => adjustDate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2 px-3">
            <CalendarIcon className="w-4 h-4 text-blue-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-sm font-bold focus:ring-0 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => adjustDate(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            disabled={date === new Date().toISOString().split("T")[0]}
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openMarkHolidayAllModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl text-sm font-bold transition-all border border-purple-100 dark:border-purple-800"
          >
            <CalendarIcon className="w-4 h-4" />
            Mark Holiday for All
          </button>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Attendance Status</th>
                <th className="px-6 py-4 text-center">Clock In</th>
                <th className="px-6 py-4 text-center">Clock Out</th>
                <th className="px-6 py-4 text-center">Working Hours</th>
                <th className="px-6 py-4 text-center">Usage (Annual)</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan="8"
                      className="px-6 py-6 h-12 bg-gray-50/20 dark:bg-slate-800/20"
                    />
                  </tr>
                ))
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isFuture = date > todayStr;
                  const isPast = date < todayStr;
                  const dojStr = emp.joiningDate
                    ? new Date(emp.joiningDate).toISOString().split("T")[0]
                    : null;
                  const isBeforeJoining = dojStr && date < dojStr;
                  const isMissedOut =
                    isPast &&
                    emp.attendance?.clockIn &&
                    !emp.attendance?.clockOut;
                  const isDisabled =
                    updating === emp._id || isBeforeJoining || isFuture;

                  return (
                    <tr
                      key={emp._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50"
                    >
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
                          onChange={(e) => {
                            if (e.target.value === "holiday") {
                              openMarkHolidaySingleModal(emp._id);
                            } else {
                              handleUpdateStatus(emp._id, e.target.value);
                            }
                          }}
                          disabled={isDisabled}
                          className={`text-xs font-bold uppercase rounded-lg border-none focus:ring-2 focus:ring-blue-500 px-3 py-1.5 cursor-pointer dark:bg-slate-900 ${
                            isBeforeJoining || isFuture
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
                            ? new Date(
                                emp.attendance.clockIn,
                              ).toLocaleTimeString([], {
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
                            ? new Date(
                                emp.attendance.clockOut,
                              ).toLocaleTimeString([], {
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
                            if (
                              !emp.attendance?.clockIn ||
                              !emp.attendance?.clockOut
                            )
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
                        {updating === emp._id ? (
                          <Loader2 className="w-5 h-5 animate-spin ml-auto text-blue-500" />
                        ) : (
                          <div className="flex justify-end gap-2">
                            {isMissedOut && (
                              <button
                                onClick={() => openRegularizeModal(emp._id)}
                                title="Regularize (Fix Exit Time)"
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                onViewHistory && onViewHistory(emp._id)
                              }
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InputModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onSubmit={handleModalSubmit}
        title={modalState.title}
        label={modalState.label}
        defaultValue={modalState.defaultValue}
        placeholder={modalState.placeholder}
      />

      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        onClose={() =>
          setConfirmModalState({ ...confirmModalState, isOpen: false })
        }
        onConfirm={handleConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
      />
    </div>
  );
}
