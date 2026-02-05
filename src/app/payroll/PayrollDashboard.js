"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Mail } from "lucide-react";
import PayrollStats from "@/components/payroll/PayrollStats";
import PayrollFilters from "@/components/payroll/PayrollFilters";
import PayrollTable from "@/components/payroll/PayrollTable";
import { usePayroll } from "@/hooks/usePayroll";
import { useModal } from "@/contexts/ModalContext";
import SendBulkSlipsModal from "@/components/payroll/slip/SendBulkSlipsModal";
import PermissionGate from "@/components/ui/PermissionGate";

export default function PayrollDashboard() {
  const router = useRouter();
  const { alert } = useModal();

  // Use custom hook
  const {
    employees,
    stats,
    loading: hookLoading,
    error: hookError,
    fetchEmployees,
    fetchPayrollStats,
  } = usePayroll();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSendBulkModalOpen, setIsSendBulkModalOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Local state for dropdown options to avoid flickering on refetch
  // Ideally, these could also come from an API or be derived from a larger cached dataset.
  // For now, we derive from *all* loaded employees history or hardcode basics if list is empty?
  // Current refactor uses server-side pagination, so "deriving from loaded" might be incomplete for filters.
  // But let's keep the existing logic:
  // "Get unique states from employees" -> This was bad if only page 1 is loaded.
  // However, without a dedicated filters API, we can't do much better easily.
  // Let's keep it as is, understanding the limitation, or pre-define common departments.

  const uniqueStates =
    employees.length > 0
      ? [...new Set(employees.map((e) => e.salary?.state || e.state || "N/A"))]
          .filter(Boolean)
          .sort()
      : [];

  const uniqueDepartments =
    employees.length > 0
      ? [...new Set(employees.map((e) => e.department || "N/A"))]
          .filter(Boolean)
          .sort()
      : [];

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
    [loading, loadingMore, hasMore],
  );

  // Initial Fetch & Stats
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Reset page
      setPage(1);

      // Fetch Stats
      fetchPayrollStats();

      // Fetch Employees
      const params = {
        page: 1,
        limit: 20,
        search: searchTerm,
        status: filterStatus,
        state: filterState,
        department: filterDepartment,
      };
      const data = await fetchEmployees(params);

      if (data?.employees?.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setLoading(false);
    };

    init();
  }, [
    searchTerm,
    filterStatus,
    filterState,
    filterDepartment,
    fetchEmployees,
    fetchPayrollStats,
  ]);

  // Load More
  useEffect(() => {
    if (page > 1) {
      Promise.resolve().then(() => setLoadingMore(true));
      const params = {
        page: page,
        limit: 20,
        search: searchTerm,
        status: filterStatus,
        state: filterState,
        department: filterDepartment,
      };
      fetchEmployees(params).then((data) => {
        setLoadingMore(false);
        if (data?.employees?.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [
    page,
    fetchEmployees,
    searchTerm,
    filterStatus,
    filterState,
    filterDepartment,
  ]);

  return (
    <PermissionGate permission="payroll">
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
          <div className="flex gap-2">
            <button
              onClick={() => setIsSendBulkModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300 dark:border-slate-600"
            >
              <Mail className="w-5 h-5" />
              Send Emails
            </button>
            <button
              onClick={() => router.push("/payroll/generate")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Generate Slips
            </button>
          </div>
        </div>

        <SendBulkSlipsModal
          isOpen={isSendBulkModalOpen}
          onClose={() => setIsSendBulkModalOpen(false)}
        />

        <PayrollStats stats={stats} />

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
          error={hookError}
          lastElementRef={lastEmployeeElementRef}
        />

        {loadingMore && (
          <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading more
            employees...
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
