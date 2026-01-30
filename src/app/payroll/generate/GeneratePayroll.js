"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import GenerateFilters from "@/components/payroll/generate/GenerateFilters";
import GenerateTable from "@/components/payroll/generate/GenerateTable";

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
  }, [fetchData]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch employees
      const empRes = await fetch("/api/payroll/employees");
      const empData = await empRes.json();
      setEmployees(empData.employees || []);

      // Fetch existing slips for selected period
      const slipRes = await fetch(
        `/api/payroll/slips?month=${selectedMonth}&year=${selectedYear}`,
      );
      const slipData = await slipRes.json();
      setSlips(slipData.slips || []);

      // Initialize LOP data
      const initialLop = {};
      empData.employees?.forEach((e) => {
        const slip = slipData.slips?.find((s) => s.userId._id === e._id);
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
  }, [selectedMonth, selectedYear]);

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
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Generate Payroll
            </h1>
            <p className="text-gray-500 text-sm">
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
