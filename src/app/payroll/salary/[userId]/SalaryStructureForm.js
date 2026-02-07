"use client";

import { useState, useEffect, useCallback } from "react";
import { useModal } from "@/contexts/ModalContext";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Trash2, RotateCcw } from "lucide-react";
import SalaryConfiguration from "@/components/payroll/salary/SalaryConfiguration";
import SalaryEarnings from "@/components/payroll/salary/SalaryEarnings";
import SalaryDeductions from "@/components/payroll/salary/SalaryDeductions";
import SalaryPreview from "@/components/payroll/salary/SalaryPreview";
import { usePayroll } from "@/hooks/usePayroll";

export default function SalaryStructureForm({ userId, sessionUserId }) {
  const router = useRouter();
  const { confirm, alert } = useModal();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);

  // Use custom hook
  const { getSalaryStructure, updateSalaryStructure, deleteSalaryStructure } =
    usePayroll();

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
    tdsApplicable: false,
    taxRegime: "new",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getSalaryStructure(userId);

    if (result.success) {
      const data = result.data;
      setUser(data.user);
      setSettings(data.settings);
      if (data.salary) {
        setSalary({
          ...data.salary,
          state: data.salary.state || data.user.state || "Maharashtra",
          employeeId: data.user.employeeId || "",
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
          employeeId: data.user.employeeId || "",
          department: data.user.department,
          joiningDate: data.user.joiningDate,
        }));
      }
    } else {
      await alert({
        title: "Error",
        message: result.error || "Failed to load salary structure",
        variant: "danger",
      });
    }
    setLoading(false);
  }, [userId, getSalaryStructure, alert]);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

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

    const result = await updateSalaryStructure(userId, salary);

    if (result.success) {
      await alert({
        title: "Success",
        message: "Salary structure saved successfully!",
        variant: "success",
      });
      router.push("/payroll");
      router.refresh();
    } else {
      await alert({
        title: "Error",
        message: result.error || "Failed to save salary structure",
        variant: "danger",
      });
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (
      !(await confirm({
        title: "Reset Salary Structure",
        message:
          "Are you sure you want to reset all fields to default values? This will clear all unsaved changes.",
        variant: "warning",
        confirmText: "Reset",
      }))
    ) {
      return;
    }

    setSalary({
      userId: userId,
      state: user?.state || "Maharashtra",
      employeeId: user?.employeeId || "",
      department: user?.department,
      joiningDate: user?.joiningDate,
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
      tdsApplicable: false,
      taxRegime: "new",
    });
  };

  const handleDelete = async () => {
    if (
      !(await confirm({
        title: "Delete Salary Structure",
        message: `Are you sure you want to delete the salary structure for ${user?.name}? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      }))
    ) {
      return;
    }

    setSaving(true);
    const result = await deleteSalaryStructure(userId);

    if (result.success) {
      await alert({
        title: "Success",
        message: "Salary structure deleted successfully!",
        variant: "success",
      });
      router.push("/payroll");
      router.refresh();
    } else {
      await alert({
        title: "Error",
        message: result.error || "Failed to delete salary structure",
        variant: "danger",
      });
    }
    setSaving(false);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">
              Salary Structure
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-slate-400">
              Configure salary for {user?.name} ({user?.designation})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleReset}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleDelete}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-blue-500/20 active:scale-95"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
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
