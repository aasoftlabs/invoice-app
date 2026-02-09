"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import AttendanceRow from "@/components/attendance/AttendanceRow";
import { useToast } from "@/contexts/ToastContext";

export default function AttendanceAdminGrid({ onViewHistory }) {
  const { addToast } = useToast();
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
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

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setUnauthorized(false);
      setUnauthorized(false);
      const res = await fetch(`/api/attendance/admin?date=${date}`, {
        cache: "no-store",
      });

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
        { cache: "no-store" },
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
  }, [date]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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
      addToast(error.message, "error");
    } finally {
      setUpdating(null);
    }
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [employees, searchTerm],
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
      addToast("Failed to mark holidays: " + error.message, "error");
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
        addToast("Invalid time format. Please use HH:mm (e.g. 18:00)", "error");
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
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        <div className="flex flex-row items-center gap-2 sm:gap-3 pb-1 sm:pb-0">
          <div className="shrink-0 flex items-center gap-1 sm:gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <button
              type="button"
              onClick={() => adjustDate(-1)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
            <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none text-[12px] sm:text-sm font-bold focus:ring-0 text-gray-900 dark:text-white cursor-pointer w-[100px] sm:w-auto"
              />
            </div>
            <button
              type="button"
              onClick={() => adjustDate(1)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              disabled={date === new Date().toISOString().split("T")[0]}
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            </button>
          </div>

          <button
            type="button"
            onClick={openMarkHolidayAllModal}
            className="flex-1 sm:flex-initial shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl text-[12px] sm:text-sm font-bold transition-all border border-purple-100 dark:border-purple-800 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
            <span>Holiday for All</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
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
                  // eslint-disable-next-line react/no-array-index-key
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
                filteredEmployees.map((emp) => (
                  <AttendanceRow
                    key={emp._id}
                    emp={emp}
                    date={date}
                    yearlySummary={yearlySummary}
                    updatingId={updating}
                    onStatusChange={(userId, status) => {
                      if (status === "holiday") {
                        openMarkHolidaySingleModal(userId);
                      } else {
                        handleUpdateStatus(userId, status);
                      }
                    }}
                    onRegularize={openRegularizeModal}
                    onViewHistory={onViewHistory}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i} className="p-4 animate-pulse space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-10 bg-gray-50 dark:bg-slate-800 rounded" />
              </div>
            ))
          ) : filteredEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No employees found
            </div>
          ) : (
            filteredEmployees.map((emp) => (
              <div key={emp._id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {emp.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {emp.employeeId || emp._id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onViewHistory && onViewHistory(emp._id)}
                    className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </span>
                    <select
                      value={emp.attendance?.status || "absent"}
                      onChange={(e) => {
                        const status = e.target.value;
                        if (status === "holiday") {
                          openMarkHolidaySingleModal(emp._id);
                        } else {
                          handleUpdateStatus(emp._id, status);
                        }
                      }}
                      disabled={updating === emp._id}
                      className={`text-[11px] font-bold uppercase rounded-lg border-none focus:ring-2 focus:ring-blue-500 px-2 py-1.5 dark:bg-slate-900 ${emp.attendance?.status === "present"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : emp.attendance?.status === "half_day"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                          : ["cl", "sl", "el", "pl"].includes(
                            emp.attendance?.status,
                          )
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                            : emp.attendance?.status === "holiday"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        }`}
                    >
                      <option
                        value="present"
                        className="bg-white dark:bg-slate-900 text-green-600 font-bold"
                      >
                        Present
                      </option>
                      <option
                        value="half_day"
                        className="bg-white dark:bg-slate-900 text-amber-600 font-bold"
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
                        className="bg-white dark:bg-slate-900 text-red-600 font-bold"
                      >
                        Absent
                      </option>
                      <option
                        value="lop"
                        className="bg-white dark:bg-slate-900 text-red-600 font-bold"
                      >
                        LOP
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="grid grid-cols-2 gap-4 pb-2 border-b dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                          In
                        </div>
                        <div className="text-sm font-bold text-gray-700 dark:text-slate-300">
                          {emp.attendance?.clockIn
                            ? new Date(
                              emp.attendance.clockIn,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            : "--:--"}
                        </div>
                      </div>
                      <div className="text-center border-l dark:border-slate-700">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">
                          Out
                        </div>
                        <div className="text-sm font-bold text-gray-700 dark:text-slate-300">
                          {emp.attendance?.clockOut
                            ? new Date(
                              emp.attendance.clockOut,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                            : "--:--"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex gap-2.5 text-[10px] font-bold">
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
                      <div className="text-[10px] text-gray-400 italic">
                        Source: {emp.attendance?.source || "manual"}
                      </div>
                    </div>
                  </div>

                  {!!emp.attendance?.clockIn && !emp.attendance?.clockOut && (
                    <button
                      type="button"
                      onClick={() => openRegularizeModal(emp._id)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-100 dark:border-blue-800"
                    >
                      <Edit3 className="w-4 h-4" /> Regularize Exit
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalState.isOpen ? (
        <InputModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onSubmit={handleModalSubmit}
          title={modalState.title}
          label={modalState.label}
          defaultValue={modalState.defaultValue}
          placeholder={modalState.placeholder}
        />
      ) : null}

      {confirmModalState.isOpen ? (
        <ConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() =>
            setConfirmModalState({ ...confirmModalState, isOpen: false })
          }
          onConfirm={handleConfirm}
          title={confirmModalState.title}
          message={confirmModalState.message}
        />
      ) : null}
    </div>
  );
}
