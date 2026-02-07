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

  const fetchAttendance = useCallback(async () => {
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
      </div>

      {modalState.isOpen ? <InputModal
          isOpen={modalState.isOpen}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
          onSubmit={handleModalSubmit}
          title={modalState.title}
          label={modalState.label}
          defaultValue={modalState.defaultValue}
          placeholder={modalState.placeholder}
        /> : null}

      {confirmModalState.isOpen ? <ConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() =>
            setConfirmModalState({ ...confirmModalState, isOpen: false })
          }
          onConfirm={handleConfirm}
          title={confirmModalState.title}
          message={confirmModalState.message}
        /> : null}
    </div>
  );
}
