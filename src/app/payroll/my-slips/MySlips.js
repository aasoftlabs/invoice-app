"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal } from "@/contexts/ModalContext";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { usePayroll } from "@/hooks/usePayroll";

export default function MySlips({ userId }) {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [actionLoading, setActionLoading] = useState(null);
  const { confirm, alert } = useModal();

  // Use custom hook
  const { slips, fetchSlips, generateSlips } = usePayroll();

  const loadSlips = useCallback(async () => {
    setLoading(true);
    await fetchSlips({
      userId,
      year: selectedYear || undefined,
      mySlips: !userId, // If no userId provided, it's the user's own slips
    });
    setLoading(false);
  }, [userId, selectedYear, fetchSlips]);

  useEffect(() => {
    loadSlips();
  }, [loadSlips]);

  const handleDelete = async (slipId) => {
    if (
      !(await confirm({
        title: "Delete Salary Slip",
        message: "Are you sure you want to delete this salary slip?",
        variant: "danger",
        confirmText: "Delete",
      }))
    )
      return;

    setActionLoading(slipId);
    try {
      const res = await fetch(`/api/payroll/slips/${slipId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await alert({
          title: "Success",
          message: "Slip deleted successfully!",
          variant: "success",
        });
        loadSlips(); // Refresh list
      } else {
        await alert({
          title: "Error",
          message: "Failed to delete slip",
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error deleting slip:", error);
      await alert({
        title: "Error",
        message: "Error deleting slip",
        variant: "danger",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecreate = async (slip) => {
    if (
      !(await confirm({
        title: "Recreate Slip",
        message:
          "Are you sure you want to recreate this slip? This will recalculate values based on current settings and overwrite the existing one.",
        variant: "warning",
        confirmText: "Recreate",
      }))
    )
      return;

    setActionLoading(slip._id);

    const result = await generateSlips({
      userId: slip.userId._id,
      month: slip.month,
      year: slip.year,
      lopDays: slip.lopDays,
      overwrite: true,
    });

    if (result.success) {
      await alert({
        title: "Success",
        message: "Slip recreated successfully!",
        variant: "success",
      });
      loadSlips(); // Refresh list
    } else {
      await alert({
        title: "Error",
        message: "Failed to recreate slip: " + result.error,
        variant: "danger",
      });
    }
    setActionLoading(null);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Get available years from slips
  const availableYears = [
    ...new Set([...slips.map((slip) => slip.year), new Date().getFullYear()]),
  ].sort((a, b) => b - a);

  return (
    <div>
      {/* Year Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Filter by year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedYear(val === "" ? "" : parseInt(val));
            }}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Slips Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-slate-400">
          Loading salary slips...
        </div>
      ) : slips.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-300 mb-2">
            No Salary Slips Found
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            You don&apos;t have any salary slips for the selected year.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slips.map((slip) => (
            <div
              key={slip._id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {monthNames[slip.month - 1]} {slip.year}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Generated on{" "}
                      {new Date(slip.generatedAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                    slip.status === "paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : slip.status === "finalized"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                  }`}
                >
                  {slip.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    Gross Salary:
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(slip.earnings.gross)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    Deductions:
                  </span>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    -{formatCurrency(slip.deductions.total)}
                  </span>
                </div>
                <div className="border-t dark:border-slate-700 pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Net Pay:
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(slip.netPay)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    window.open(`/payroll/slip/${slip._id}`, "_blank")
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => handleRecreate(slip)}
                  disabled={actionLoading === slip._id}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Recreate/Recalculate"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${actionLoading === slip._id ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() =>
                    window.open(`/payroll/slip/${slip._id}/download`, "_blank")
                  }
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(slip._id)}
                  disabled={actionLoading === slip._id}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete Slip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
