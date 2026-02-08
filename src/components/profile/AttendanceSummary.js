"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

export default function AttendanceSummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSummary() {
            try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();

                const res = await fetch(
                    `/api/attendance/summary?month=${month}&year=${year}`
                );
                const data = await res.json();

                if (data.success && data.summary) {
                    // Get the current user's summary (the API now returns only the user's data)
                    const userSummary = Object.values(data.summary)[0] || {
                        lop: 0,
                        cl: 0,
                        sl: 0,
                        el: 0,
                        pl: 0,
                        holiday: 0,
                        absent: 0,
                        halfDay: 0,
                        present: 0,
                    };
                    setSummary(userSummary);
                }
            } catch (error) {
                console.error("Error fetching attendance summary:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
                    Loading attendance...
                </p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No Attendance Data
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2">
                    No attendance records found for this month.
                </p>
            </div>
        );
    }

    const currentMonth = new Date().toLocaleString("default", { month: "long" });
    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    {currentMonth} {currentYear} - Attendance
                </h3>
            </div>

            {/* Present & LOP Summary */}
            <div className="grid grid-cols-2 border-b border-gray-100 dark:border-slate-700">
                <div className="p-4 sm:p-6 bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-semibold text-green-900 dark:text-green-300 uppercase tracking-wider">
                            Present Days
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                        {summary.present}
                    </div>
                </div>
                <div className="p-4 sm:p-6 bg-red-50/50 dark:bg-red-900/10 border-l border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-semibold text-red-900 dark:text-red-300 uppercase tracking-wider">
                            LOP
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                        {summary.lop}
                    </div>
                </div>
            </div>

            {/* Leaves & Attendance Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700">
                {/* Leaves */}
                <div className="p-4 sm:p-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                        Leaves
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Casual Leave (CL)</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.cl}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Sick Leave (SL)</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.sl}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Earned Leave (EL)</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.el}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Privilege Leave (PL)</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.pl}</span>
                        </div>
                    </div>
                </div>

                {/* Other Stats */}
                <div className="p-4 sm:p-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
                        Other
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Holidays</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.holiday}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Half Day</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.halfDay}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-slate-400">Absent</span>
                            <span className="font-medium text-gray-900 dark:text-white">{summary.absent}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
