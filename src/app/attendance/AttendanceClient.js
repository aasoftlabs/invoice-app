"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Users,
  MapPin,
  History,
  CheckCircle2,
  LogIn,
  LogOut,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import AttendancePunchCard from "./AttendancePunchCard";
import AttendanceHistoryTable from "./AttendanceHistoryTable";
import AttendanceAdminGrid from "./AttendanceAdminGrid";

export default function AttendanceClient({ user }) {
  const { data: session } = useSession();
  const isAdmin =
    session?.user?.role === "admin" ||
    session?.user?.permissions?.includes("payroll");

  const [activeTab, setActiveTab] = useState(isAdmin ? "admin" : "me");

  // Switch to "me" tab if admin access is revoked while on admin tab
  useEffect(() => {
    if (!isAdmin && activeTab === "admin") {
      setActiveTab("me");
    }
  }, [isAdmin, activeTab]);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);

  const fetchMyRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance/mark");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRecords(data);

      // Find today's record
      const today = new Date().toISOString().split("T")[0];
      const todayRec = data.find(
        (r) => new Date(r.date).toISOString().split("T")[0] === today,
      );
      setTodayRecord(todayRec);
    } catch (error) {
      console.error("Error fetching my records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRecords();
  }, []);

  const handlePunch = async () => {
    try {
      const res = await fetch("/api/attendance/mark", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh data
      fetchMyRecords();
    } catch (error) {
      alert("Failed to mark attendance: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      {isAdmin && (
        <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === "admin"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <Users className="w-4 h-4" />
            Admin Dashboard
          </button>
          <button
            onClick={() => setActiveTab("me")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === "me"
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <History className="w-4 h-4" />
            My Attendance
          </button>
        </div>
      )}

      {activeTab === "me" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <AttendancePunchCard
              record={todayRecord}
              onPunch={handlePunch}
              loading={loading}
            />

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                Current Month
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Present
                  </div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {records.filter((r) => r.status === "present").length}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Half Day
                  </div>
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {records.filter((r) => r.status === "half_day").length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <AttendanceHistoryTable records={records} loading={loading} />
          </div>
        </div>
      ) : (
        <AttendanceAdminGrid />
      )}
    </div>
  );
}
