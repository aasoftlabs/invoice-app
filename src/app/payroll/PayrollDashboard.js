"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import PayrollStats from "@/components/payroll/PayrollStats";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable from "@/components/payroll/PayrollTable";

export default function PayrollDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Observer for infinite scroll
  const observer = useRef();
  const lastEmployeeElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );


  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Fetch Employees
  const fetchEmployees = useCallback(
    async (isLoadMore = false, currentPage = 1) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const query = new URLSearchParams({
          page: currentPage,
          limit: 20,
          search: searchTerm,
          status: filterStatus,
          state: filterState,
          department: filterDepartment
        }).toString();

        const res = await fetch(`/api/payroll/employees?${query}`, { cache: "no-store" });

        if (res.ok) {
          const data = await res.json();
          if (isLoadMore) {
            setEmployees(prev => [...prev, ...data.employees]);
          } else {
            setEmployees(data.employees);
          }

          if (data.employees.length < 20) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }

        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to fetch employees");
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError(error.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, filterStatus, filterState, filterDepartment]
  );

  // Initial Fetch & Filter Change
  useEffect(() => {
    setPage(1);
    fetchEmployees(false, 1);
  }, [searchTerm, filterStatus, filterState, filterDepartment, fetchEmployees]);

  // Load More
  useEffect(() => {
    if (page > 1) {
      fetchEmployees(true, page);
    }
  }, [page, fetchEmployees]);


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

  // Removed client-side filtering: filteredEmployees replaced by employees state


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Payroll Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Manage employee salaries and generate slips
          </p>
        </div>
        <button
          onClick={() => router.push("/payroll/generate")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
        employees={employees}
        loading={loading}
        error={error}
        lastElementRef={lastEmployeeElementRef}
      />

      {loadingMore && (
        <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading more employees...
        </div>
      )}
    </div>
  );
}
