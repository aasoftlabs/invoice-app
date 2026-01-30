"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";
import SalaryConfiguration from "@/components/payroll/salary/SalaryConfiguration";
import SalaryEarnings from "@/components/payroll/salary/SalaryEarnings";
import SalaryDeductions from "@/components/payroll/salary/SalaryDeductions";
import SalaryPreview from "@/components/payroll/salary/SalaryPreview";

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

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const fetchData = useCallback(async () => {
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
    }, [userId]);

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
            pf = Math.round(salary.basic * 0.12);
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
                    <SalaryConfiguration salary={salary} handleChange={handleChange} />

                    {/* Earnings */}
                    <SalaryEarnings
                        salary={salary}
                        handleNumberChange={handleNumberChange}
                        handleDynamicChange={handleDynamicChange}
                        addDynamicField={addDynamicField}
                        removeDynamicField={removeDynamicField}
                    />

                    {/* Deductions */}
                    <SalaryDeductions
                        salary={salary}
                        handleNumberChange={handleNumberChange}
                        handleDynamicChange={handleDynamicChange}
                        addDynamicField={addDynamicField}
                        removeDynamicField={removeDynamicField}
                    />
                </div>

                {/* Real-time Estimate */}
                <div className="lg:col-span-1">
                    <SalaryPreview estimate={estimate} />
                </div>
            </div>
        </div>
    );
}
