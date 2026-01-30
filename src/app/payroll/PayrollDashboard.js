"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import PayrollStats from "@/components/payroll/PayrollStats";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable from "@/components/payroll/PayrollTable";

export default function PayrollDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/payroll/employees", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch employees");
        console.error("Failed to fetch employees:", errData);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique states from employees
  const uniqueStates = [
    ...new Set(employees.map((e) => e.salary?.state || e.state || "N/A")),
  ]
    .filter(Boolean)
    .sort();

  // Get unique departments from employees
  const uniqueDepartments = [
    ...new Set(employees.map((e) => e.department || "N/A")),
  ]
    .filter(Boolean)
    .sort();

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "with_salary"
          ? !!emp.salary
          : !emp.salary; // setup_pending

    const empState = emp.salary?.state || emp.state || "N/A";
    const matchesState =
      filterState === "all" ? true : empState === filterState;

    const empDepartment = emp.department || "N/A";
    const matchesDepartment =
      filterDepartment === "all" ? true : empDepartment === filterDepartment;

    return matchesSearch && matchesStatus && matchesState && matchesDepartment;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payroll Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage employee salaries and generate slips
          </p>
        </div>
        <button
          onClick={() => router.push("/payroll/generate")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Slips
        </button>
      </div>

      <PayrollStats employees={employees} />

      <PayrollFilters
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterState={filterState}
        setFilterState={setFilterState}
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        uniqueStates={uniqueStates}
        uniqueDepartments={uniqueDepartments}
      />

      <PayrollTable
        employees={filteredEmployees}
        loading={loading}
        error={error}
      />
    </div>
  );
}
