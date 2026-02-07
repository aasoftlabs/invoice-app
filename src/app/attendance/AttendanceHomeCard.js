"use client";

import { useState, useEffect } from "react";
import AttendancePunchCard from "./AttendancePunchCard";
import AttendanceCalendar from "./AttendanceCalendar";
import { Loader2, Calendar, Info } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";

export default function AttendanceHomeCard({ user }) {
  const [record, setRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [view, setView] = useState("punch"); // 'punch' or 'calendar'
  const [joiningDate, setJoiningDate] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/attendance/mark");
      const data = await res.json();

      const today = new Date().toISOString().split("T")[0];
      const todayRecord = data.find((r) => r.date.startsWith(today));

      setRecord(todayRecord || null);
      setRecords(data);

      // Fetch user specific DOJ
      const userRes = await fetch("/api/users/profile");
      const userData = await userRes.json();
      if (userData.joiningDate) {
        setJoiningDate(userData.joiningDate);
      }

      // If clocked out today, show calendar by default
      if (todayRecord?.clockOut) {
        setView("calendar");
      } else {
        setView("punch");
      }
    } catch (error) {
      console.error("Error fetching home attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePunch = async () => {
    try {
      setPunching(true);
      const res = await fetch("/api/attendance/mark", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRecord(data.attendance);

      // Refresh all records to update calendar
      const recordsRes = await fetch("/api/attendance/mark");
      const recordsData = await recordsRes.json();
      setRecords(recordsData);

      if (data.attendance.clockOut) {
        setTimeout(() => setView("calendar"), 2000); // Wait a bit before switching
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setPunching(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Spotlight
      className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col"
      spotlightColor="rgba(59, 130, 246, 0.1)"
    >
      <div className="flex justify-between items-center mb-4 z-10">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {view === "calendar" ? (
            <>
              <Calendar className="w-5 h-5 text-blue-500" /> Attendance Log
            </>
          ) : (
            "Quick Punch"
          )}
        </h3>
        <button
          onClick={() => setView(view === "punch" ? "calendar" : "punch")}
          className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          {view === "punch" ? "View Calendar" : "Punch Card"}
        </button>
      </div>

      <div className="flex-1 z-10">
        {view === "punch" ? (
          <div>
            {joiningDate &&
            new Date().toISOString().split("T")[0] <
              new Date(joiningDate).toISOString().split("T")[0] ? (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Not Joined Yet
                </h4>
                <p className="text-sm text-gray-500 mt-2">
                  Your joining date is set to{" "}
                  <strong>{new Date(joiningDate).toLocaleDateString()}</strong>.
                  You can start marking attendance from that day.
                </p>
              </div>
            ) : (
              <AttendancePunchCard
                record={record}
                onPunch={handlePunch}
                loading={punching}
                minimal
              />
            )}
          </div>
        ) : (
          <AttendanceCalendar records={records} minimal />
        )}
      </div>
    </Spotlight>
  );
}
