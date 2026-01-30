"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/project/StatsCard";
import MonthlyChart from "@/components/project/MonthlyChart";
import ProjectFilters from "@/components/project/ProjectFilters";
import ActiveTaskCard from "@/components/project/ActiveTaskCard";
import WorkLogTable from "@/components/project/WorkLogTable";
import {
  CheckCircle,
  ListTodo,
  FolderKanban,
} from "lucide-react";

export default function ProjectDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Note: projects and tasks states were defined but unused in the original code beyond fetching.
  // Kept logic consistent with original but removed unused imports if any.

  // Filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filters, setFilters] = useState({
    year: currentYear,
    month: currentMonth,
    userId: session?.user?.role === "admin" ? "" : session?.user?.id,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (session) {
      if (session.user.role === "admin" && users.length === 0) {
        fetchUsers();
      }
      // Re-fetch data when session exists and filters change
      fetchDashboardData();
      fetchWorkLogs();
      // fetchProjects(); // Unused in UI
      // fetchTasks();    // Unused in UI
    }
  }, [session, filters]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: filters.year,
        ...(filters.userId && { userId: filters.userId }),
      });

      const res = await fetch(`/api/dashboard/stats?${params}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkLogs = async () => {
    try {
      const params = new URLSearchParams({
        month: filters.month,
        year: filters.year,
        ...(filters.userId && { userId: filters.userId }),
      });

      const res = await fetch(`/api/worklogs?${params}`);
      const data = await res.json();
      if (data.success) {
        setWorkLogs(data.data.slice(0, 10)); // Latest 10 logs
      }
    } catch (error) {
      console.error("Error fetching work logs:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Project Tracker
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor your project progress and daily work
            </p>
          </div>
        </div>

        {/* Filters */}
        <ProjectFilters
          filters={filters}
          setFilters={setFilters}
          users={users}
          isAdmin={session?.user?.role?.toLowerCase() === "admin"}
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Total Projects"
            value={stats?.stats?.totalProjects || 0}
            icon={FolderKanban}
            color="blue"
          />
          <StatsCard
            title="Completed Projects"
            value={stats?.stats?.completedProjects || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Total Tasks"
            value={stats?.stats?.totalTasks || 0}
            icon={ListTodo}
            color="purple"
          />
          <StatsCard
            title="Completed Tasks"
            value={stats?.stats?.completedTasks || 0}
            icon={CheckCircle}
            color="orange"
          />
        </div>

        {/* Current Active Project/Task */}
        <ActiveTaskCard activeStats={stats?.currentActive} />

        {/* Monthly Graph */}
        {stats?.monthlyData && (
          <div className="mb-6">
            <MonthlyChart data={stats.monthlyData} />
          </div>
        )}

        {/* Recent Work Logs */}
        <WorkLogTable workLogs={workLogs} formatDate={formatDate} />
      </div>
    </div>
  );
}
