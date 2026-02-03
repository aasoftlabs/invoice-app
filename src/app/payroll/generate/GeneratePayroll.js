"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { ArrowLeft } from "lucide-react";
import GenerateFilters from "@/components/payroll/generate/GenerateFilters";
import GenerateTable from "@/components/payroll/generate/GenerateTable";
import { usePayroll } from "@/hooks/usePayroll";

export default function GeneratePayroll() {
  const { alert } = useModal();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [slips, setSlips] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [processing, setProcessing] = useState(false);
  const [lopData, setLopData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Use custom hook
  const { employees, fetchEmployees, fetchSlips, generateSlips } = usePayroll();

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // Fetch data in parallel
      const [employeeData, slipData] = await Promise.all([
        fetchEmployees({ all: true }),
        fetchSlips({
          month: selectedMonth,
          year: selectedYear,
        }),
      ]);

      const currentEmployees = employeeData?.employees || [];
      const currentSlips = slipData || [];

      setSlips(currentSlips);

      // Initialize LOP data using the fresh data from the fetches
      const initialLop = {};
      currentEmployees.forEach((e) => {
        const slip = currentSlips.find((s) => s.userId._id === e._id);
        initialLop[e._id] = slip ? slip.lopDays : 0;
      });
      setLopData(initialLop);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, fetchEmployees, fetchSlips]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Re-fetch when month/year changes

  const handleGenerate = async (userId) => {
    setProcessing(userId);

    // Check if slip already exists for this user
    const existingSlip = getSlipStatus(userId);

    const result = await generateSlips({
      userId,
      month: selectedMonth,
      year: selectedYear,
      lopDays: parseFloat(lopData[userId]) || 0,
      overwrite: !!existingSlip, // Pass true if regenerating
    });

    if (result.success) {
      await alert({
        title: "Success",
        message: "Salary slip generated successfully!",
        variant: "success",
      });
      // Refresh data after successful generation
      await fetchData();
    } else {
      await alert({
        title: "Error",
        message: result.error || "Failed to generate slip",
        variant: "danger",
      });
    }
    setProcessing(false);
  };

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getSlipStatus = (userId) => {
    return slips.find((s) => s.userId._id === userId);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/payroll")}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Generate Payroll
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Generate or regenerate salary slips for employees
            </p>
          </div>
        </div>
      </div>

      <GenerateFilters
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <GenerateTable
        employees={filteredEmployees}
        loading={loading}
        lopData={lopData}
        setLopData={setLopData}
        processing={processing}
        handleGenerate={handleGenerate}
        getSlipStatus={getSlipStatus}
      />
    </div>
  );
}
