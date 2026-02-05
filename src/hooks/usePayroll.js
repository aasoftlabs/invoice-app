import { useState, useCallback } from "react";

export const usePayroll = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data States
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [slips, setSlips] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);

  // --- Employees ---

  const fetchEmployees = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);
      if (filters.search) params.append("search", filters.search);
      if (filters.status && filters.status !== "all")
        params.append("status", filters.status);
      if (filters.state && filters.state !== "all")
        params.append("state", filters.state);
      if (filters.department && filters.department !== "all")
        params.append("department", filters.department);

      const res = await fetch(`/api/payroll/employees?${params}`);
      const data = await res.json();

      if (res.ok) {
        setEmployees((prev) =>
          filters.page > 1 ? [...prev, ...data.employees] : data.employees,
        );
        return data;
      } else {
        throw new Error(data.error || "Failed to fetch employees");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return { employees: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayrollStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        return data.stats;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Salary Structure ---

  const getSalaryStructure = useCallback(async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/salary/${userId}`);
      const data = await res.json();
      if (data.success) {
        setSalaryStructure(data.salary);
        return { success: true, data: data };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSalaryStructure = useCallback(async (userId, salaryData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/salary/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salaryData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.salary };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Slips ---

  const generateSlips = useCallback(async (generationData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generationData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, slip: data.slip };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSlips = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);
      if (filters.userId) params.append("userId", filters.userId);

      const endpoint = "/api/payroll/slips";

      const res = await fetch(`${endpoint}?${params}`);
      const data = await res.json();

      if (data.success) {
        setSlips(data.slips);
        return data.slips;
      }
      return [];
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendanceSummary = useCallback(async (month, year) => {
    setLoading(true);
    try {
      const url = month
        ? `/api/attendance/summary?month=${month}&year=${year}`
        : `/api/attendance/summary?year=${year}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        return data;
      }
      return { summary: {}, userLopCounts: {} };
    } catch (err) {
      console.error("Error fetching attendance summary:", err);
      return { summary: {}, userLopCounts: {} };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSalaryStructure = useCallback(async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/salary/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Employees
    employees,
    fetchEmployees,
    // Stats
    stats,
    fetchPayrollStats,
    // Salary
    salaryStructure,
    getSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
    // Slips
    slips,
    generateSlips,
    fetchSlips,
    fetchAttendanceSummary,
  };
};
