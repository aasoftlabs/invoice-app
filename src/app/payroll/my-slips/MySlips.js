"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Download, Eye, Calendar, Trash2, RefreshCw } from "lucide-react";

export default function MySlips({ userId }) {
    const [slips, setSlips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [actionLoading, setActionLoading] = useState(null);

    const fetchSlips = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/payroll/slips?userId=${userId}${selectedYear ? `&year=${selectedYear}` : ""}`
            );
            if (res.ok) {
                const data = await res.json();
                setSlips(data.slips);
            }
        } catch (error) {
            console.error("Error fetching slips:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, selectedYear]);

    useEffect(() => {
        fetchSlips();
    }, [fetchSlips]);

    const handleDelete = async (slipId) => {
        if (!confirm("Are you sure you want to delete this salary slip?")) return;

        setActionLoading(slipId);
        try {
            const res = await fetch(`/api/payroll/slips/${slipId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setSlips((prev) => prev.filter((s) => s._id !== slipId));
            } else {
                alert("Failed to delete slip");
            }
        } catch (error) {
            console.error("Error deleting slip:", error);
            alert("Error deleting slip");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRecreate = async (slip) => {
        if (!confirm("Are you sure you want to recreate this slip? This will recalculate values based on current settings and overwrite the existing one.")) return;

        setActionLoading(slip._id);
        try {
            const res = await fetch("/api/payroll/slips", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: slip.userId._id,
                    month: slip.month,
                    year: slip.year,
                    lopDays: slip.lopDays,
                    overwrite: true,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                alert("Slip recreated successfully!");
                // Update specific slip in list
                setSlips((prev) =>
                    prev.map((s) => (s._id === slip._id ? data.slip : s))
                );
            } else {
                const err = await res.json();
                alert("Failed to recreate slip: " + err.error);
            }
        } catch (error) {
            console.error("Error recreating slip:", error);
            alert("Error recreating slip");
        } finally {
            setActionLoading(null);
        }
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
        ...new Set([
            ...slips.map((slip) => slip.year),
            new Date().getFullYear()
        ])
    ].sort((a, b) => b - a);

    return (
        <div>
            {/* Year Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by year:</span>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
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
                <div className="text-center py-12 text-gray-500">Loading salary slips...</div>
            ) : slips.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Salary Slips Found
                    </h3>
                    <p className="text-gray-500">
                        You don&apos;t have any salary slips for the selected year.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slips.map((slip) => (
                        <div
                            key={slip._id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {monthNames[slip.month - 1]} {slip.year}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Generated on{" "}
                                            {new Date(slip.generatedAt).toLocaleDateString("en-GB")}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-semibold uppercase ${slip.status === "paid"
                                        ? "bg-green-100 text-green-700"
                                        : slip.status === "finalized"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-gray-100 text-gray-600"
                                        }`}
                                >
                                    {slip.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Gross Salary:</span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {formatCurrency(slip.earnings.gross)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Deductions:</span>
                                    <span className="text-sm text-red-600">
                                        -{formatCurrency(slip.deductions.total)}
                                    </span>
                                </div>
                                <div className="border-t pt-2 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Net Pay:
                                    </span>
                                    <span className="text-lg font-bold text-blue-600">
                                        {formatCurrency(slip.netPay)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(`/payroll/slip/${slip._id}`, "_blank")}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => handleRecreate(slip)}
                                    disabled={actionLoading === slip._id}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors text-blue-600"
                                    title="Recreate/Recalculate"
                                >
                                    <RefreshCw className={`w-4 h-4 ${actionLoading === slip._id ? "animate-spin" : ""}`} />
                                </button>
                                <button
                                    onClick={() => window.open(`/payroll/slip/${slip._id}/download`, "_blank")}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                    title="Download PDF"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(slip._id)}
                                    disabled={actionLoading === slip._id}
                                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:bg-red-50 text-red-600 rounded-lg text-sm font-medium transition-colors"
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
