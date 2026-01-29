"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Users,
    CheckCircle,
    AlertCircle,
    Play,
    RotateCcw,
    Search,
} from "lucide-react";

export default function GeneratePayroll() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [slips, setSlips] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [processing, setProcessing] = useState(false);
    const [lopData, setLopData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch employees
            const empRes = await fetch("/api/payroll/employees");
            const empData = await empRes.json();
            setEmployees(empData.employees || []);

            // Fetch existing slips for selected period
            const slipRes = await fetch(
                `/api/payroll/slips?month=${selectedMonth}&year=${selectedYear}`
            );
            const slipData = await slipRes.json();
            setSlips(slipData.slips || []);

            // Initialize LOP data
            const initialLop = {};
            empData.employees?.forEach(e => {
                const slip = slipData.slips?.find(s => s.userId._id === e._id);
                if (slip) {
                    initialLop[e._id] = slip.lopDays;
                } else {
                    initialLop[e._id] = 0;
                }
            });
            setLopData(initialLop);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (userId) => {
        setProcessing(userId);
        try {
            const res = await fetch("/api/payroll/slips", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    month: selectedMonth,
                    year: selectedYear,
                    lopDays: parseFloat(lopData[userId]) || 0,
                }),
            });

            if (res.ok) {
                // Refresh data
                await fetchData();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to generate slip");
            }
        } catch (error) {
            console.error("Error generating slip:", error);
            alert("An error occurred");
        } finally {
            setProcessing(false);
        }
    };

    const filteredEmployees = employees.filter((e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSlipStatus = (userId) => {
        return slips.find((s) => s.userId._id === userId);
    };

    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    const years = [
        new Date().getFullYear(),
        new Date().getFullYear() - 1,
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Generate Payroll
                    </h1>
                    <p className="text-gray-500">
                        Generate or regenerate salary slips for employees
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Month
                        </label>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value} className="text-gray-900">
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                        </label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                            {years.map((y) => (
                                <option key={y} value={y} className="text-gray-900">
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Employee
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                        <tr>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Gross Salary</th>
                            <th className="px-6 py-3">Net Salary (Est.)</th>
                            <th className="px-6 py-3 w-32">LOP Days</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    No employees found
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((emp) => {
                                const slip = getSlipStatus(emp._id);
                                const isProcessing = processing === emp._id;

                                return (
                                    <tr key={emp._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp.designation || "No Designation"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {emp.salary ? (
                                                <span className="text-sm text-gray-700">
                                                    ₹{emp.salary.grossSalary?.toLocaleString("en-IN")}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-red-500 italic">No Salary Structure</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {emp.salary ? (
                                                <span className="text-sm font-semibold text-blue-600">
                                                    ₹{emp.salary.netSalary?.toLocaleString("en-IN")}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max="31"
                                                disabled={!!slip}
                                                value={lopData[emp._id] || 0}
                                                onChange={(e) => setLopData(prev => ({ ...prev, [emp._id]: e.target.value }))}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100 text-gray-900"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {slip ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                                                    <CheckCircle className="w-3 h-3" /> Generated
                                                </span>
                                            ) : !emp.salary ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">
                                                    <AlertCircle className="w-3 h-3" /> Setup Required
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {slip ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => window.open(`/payroll/slip/${slip._id}`, "_blank")}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                    >
                                                        View
                                                    </button>
                                                    {/* Regenerate logic would need API update to overwrite, treating as separate for now */}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleGenerate(emp._id)}
                                                    disabled={!emp.salary || isProcessing}
                                                    className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isProcessing ? (
                                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                                    ) : (
                                                        <Play className="w-3 h-3" />
                                                    )}
                                                    Generate
                                                </button>
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
    );
}
