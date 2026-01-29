"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Save,
    ArrowLeft,
    Calculator,
    Plus,
    Trash2,
    DollarSign,
    AlertCircle,
} from "lucide-react";

export default function SalaryStructureForm({ userId, sessionUserId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [salary, setSalary] = useState({
        userId: userId,
        state: "Maharashtra",
        basic: 0,
        da: 0,
        hra: 0,
        conveyanceAllowance: 0,
        specialAllowance: 0,
        medicalAllowance: 0,
        mobileExpense: 0,
        distanceAllowance: 0,
        bonus: 0,
        arrears: 0,
        otherAllowances: [],
        loanDeduction: 0,
        advanceDeduction: 0,
        otherDeductions: [],
        pfApplicable: true,
        esiApplicable: false,
        taxRegime: "new",
    });

    // State for calculation preview
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/payroll/salary/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setSettings(data.settings);
                if (data.salary) {
                    setSalary({
                        ...data.salary,
                        state: data.salary.state || data.user.state || "Maharashtra",
                        employeeId: data.user.employeeId,
                        department: data.user.department,
                        joiningDate: data.user.joiningDate,
                        otherAllowances: data.salary.otherAllowances || [],
                        otherDeductions: data.salary.otherDeductions || [],
                    });
                } else {
                    // Initialize with defaults
                    setSalary((prev) => ({
                        ...prev,
                        state: data.user.state || "Maharashtra",
                        employeeId: data.user.employeeId,
                        department: data.user.department,
                        joiningDate: data.user.joiningDate,
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSalary((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setSalary((prev) => ({
            ...prev,
            [name]: value === "" ? 0 : parseFloat(value),
        }));
    };

    // Dynamic fields handler
    const handleDynamicChange = (type, index, field, value) => {
        const list = [...salary[type]];
        list[index][field] = field === "amount" ? parseFloat(value) || 0 : value;
        setSalary((prev) => ({ ...prev, [type]: list }));
    };

    const addDynamicField = (type) => {
        setSalary((prev) => ({
            ...prev,
            [type]: [...prev[type], { name: "", amount: 0 }],
        }));
    };

    const removeDynamicField = (type, index) => {
        const list = [...salary[type]];
        list.splice(index, 1);
        setSalary((prev) => ({ ...prev, [type]: list }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/payroll/salary/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(salary),
            });

            if (res.ok) {
                router.push("/payroll");
                router.refresh();
            } else {
                const error = await res.json();
                alert(error.error || "Failed to save salary structure");
            }
        } catch (error) {
            console.error("Error saving salary:", error);
            alert("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    // Function to calculate estimated net pay purely on client side for quick view
    // This is an approximation; real calculation happens on backend
    const calculateEstimate = () => {
        const gross =
            (salary.basic || 0) +
            (salary.da || 0) +
            (salary.hra || 0) +
            (salary.conveyanceAllowance || 0) +
            (salary.specialAllowance || 0) +
            (salary.medicalAllowance || 0) +
            (salary.mobileExpense || 0) +
            (salary.distanceAllowance || 0) +
            (salary.bonus || 0) +
            (salary.arrears || 0) +
            salary.otherAllowances.reduce((s, i) => s + (i.amount || 0), 0);

        let pf = 0;
        if (salary.pfApplicable) {
            if (salary.pfApplicable) {
                pf = Math.round(salary.basic * 0.12);
            }
        }

        let esi = 0;
        if (salary.esiApplicable) {
            esi = Math.round(gross * 0.0075);
        }

        // Rough PT estimates (not state accurate in client preview)
        let pt = 200;
        if (gross < 7500) pt = 0;

        const totalDeductions =
            pf +
            esi +
            pt +
            (salary.loanDeduction || 0) +
            (salary.advanceDeduction || 0) +
            salary.otherDeductions.reduce((s, i) => s + (i.amount || 0), 0);

        return {
            gross,
            deductions: totalDeductions,
            net: gross - totalDeductions,
            pf,
            esi,
            pt,
        };
    };

    const estimate = calculateEstimate();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Salary Structure
                        </h1>
                        <p className="text-gray-500">
                            Configure salary for {user?.name} ({user?.designation})
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Structure
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                            Configuration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    value={salary.employeeId || ""}
                                    onChange={(e) =>
                                        setSalary({ ...salary, employeeId: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    placeholder="EMP001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    value={salary.department || ""}
                                    onChange={(e) =>
                                        setSalary({ ...salary, department: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                    placeholder="General"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Joining
                                </label>
                                <input
                                    type="date"
                                    value={
                                        salary.joiningDate
                                            ? new Date(salary.joiningDate).toISOString().split("T")[0]
                                            : ""
                                    }
                                    onChange={(e) =>
                                        setSalary({ ...salary, joiningDate: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State (for PT)
                                </label>
                                <select
                                    name="state"
                                    value={salary.state}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                >
                                    <option value="Maharashtra" className="text-gray-900">Maharashtra</option>
                                    <option value="Karnataka" className="text-gray-900">Karnataka</option>
                                    <option value="Tamil Nadu" className="text-gray-900">Tamil Nadu</option>
                                    <option value="West Bengal" className="text-gray-900">West Bengal</option>
                                    <option value="Gujarat" className="text-gray-900">Gujarat</option>
                                    <option value="Telangana" className="text-gray-900">Telangana</option>
                                    <option value="Andhra Pradesh" className="text-gray-900">Andhra Pradesh</option>
                                    <option value="Madhya Pradesh" className="text-gray-900">Madhya Pradesh</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax Regime
                                </label>
                                <select
                                    name="taxRegime"
                                    value={salary.taxRegime}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                >
                                    <option value="new" className="text-gray-900">New Regime (Default)</option>
                                    <option value="old" className="text-gray-900">Old Regime</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="pfApplicable"
                                    name="pfApplicable"
                                    checked={salary.pfApplicable}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="pfApplicable"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    PF Applicable
                                </label>
                            </div>
                            <div className="flex items-center gap-2 mt-6">
                                <input
                                    type="checkbox"
                                    id="esiApplicable"
                                    name="esiApplicable"
                                    checked={salary.esiApplicable}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="esiApplicable"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    ESI Applicable
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Earnings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Earnings (Allowances)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Basic Salary"
                                name="basic"
                                value={salary.basic}
                                onChange={handleNumberChange}
                                required
                            />
                            <InputField
                                label="Dearness Allowance (DA)"
                                name="da"
                                value={salary.da}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="HRA"
                                name="hra"
                                value={salary.hra}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Conveyance Allowance"
                                name="conveyanceAllowance"
                                value={salary.conveyanceAllowance}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Special Allowance"
                                name="specialAllowance"
                                value={salary.specialAllowance}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Medical Allowance"
                                name="medicalAllowance"
                                value={salary.medicalAllowance}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Mobile Expense"
                                name="mobileExpense"
                                value={salary.mobileExpense}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Distance Allowance"
                                name="distanceAllowance"
                                value={salary.distanceAllowance}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Bonus"
                                name="bonus"
                                value={salary.bonus}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Arrears"
                                name="arrears"
                                value={salary.arrears}
                                onChange={handleNumberChange}
                            />
                        </div>

                        {/* Other Allowances */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Other Allowances
                            </label>
                            {salary.otherAllowances.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={item.name}
                                        onChange={(e) =>
                                            handleDynamicChange(
                                                "otherAllowances",
                                                index,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={item.amount}
                                        onChange={(e) =>
                                            handleDynamicChange(
                                                "otherAllowances",
                                                index,
                                                "amount",
                                                e.target.value
                                            )
                                        }
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={() => removeDynamicField("otherAllowances", index)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addDynamicField("otherAllowances")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus className="w-4 h-4" /> Add Allowance
                            </button>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Manual Deductions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Loan Deduction"
                                name="loanDeduction"
                                value={salary.loanDeduction}
                                onChange={handleNumberChange}
                            />
                            <InputField
                                label="Advance Deduction"
                                name="advanceDeduction"
                                value={salary.advanceDeduction}
                                onChange={handleNumberChange}
                            />
                        </div>

                        {/* Other Deductions */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Other Deductions
                            </label>
                            {salary.otherDeductions.map((item, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={item.name}
                                        onChange={(e) =>
                                            handleDynamicChange(
                                                "otherDeductions",
                                                index,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={item.amount}
                                        onChange={(e) =>
                                            handleDynamicChange(
                                                "otherDeductions",
                                                index,
                                                "amount",
                                                e.target.value
                                            )
                                        }
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                                    />
                                    <button
                                        onClick={() => removeDynamicField("otherDeductions", index)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addDynamicField("otherDeductions")}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2"
                            >
                                <Plus className="w-4 h-4" /> Add Deduction
                            </button>
                        </div>
                    </div>
                </div>

                {/* Real-time Estimate */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-purple-600" />
                            Monthly Estimate
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <span className="text-gray-600">Gross Salary</span>
                                <span className="font-semibold text-green-600 text-lg">
                                    ₹{estimate.gross.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-500 pb-4 border-b">
                                <div className="flex justify-between">
                                    <span>PF (12%)</span>
                                    <span>₹{estimate.pf}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ESI (0.75%)</span>
                                    <span>₹{estimate.esi}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>PT (Est.)</span>
                                    <span>₹{estimate.pt}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b">
                                <span className="text-gray-600">Total Deductions</span>
                                <span className="font-semibold text-red-600">
                                    -₹{estimate.deductions.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-gray-800">Net Salary</span>
                                <span className="font-bold text-blue-600 text-xl">
                                    ₹{estimate.net.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs mt-4">
                                Note: This is an estimate. TDS and precise statutory deductions
                                will be calculated exactly when generating the salary slip.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputField({ label, name, value, onChange, required = false }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ₹
                </span>
                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="0"
                />
            </div>
        </div>
    );
}

function UserIcon({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
