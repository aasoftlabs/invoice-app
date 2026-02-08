"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StatsCard from "@/components/project/StatsCard";
import MonthlyChart from "@/components/project/MonthlyChart";
import ProjectFilters from "@/components/project/ProjectFilters";
import ActiveTaskCard from "@/components/project/ActiveTaskCard";
import WorkLogTable from "@/components/project/WorkLogTable";
import { CheckCircle, ListTodo, FolderKanban, Plus } from "lucide-react";
import AddWorkLogModal from "@/components/project/AddWorkLogModal";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
// No permission gate needed here, handled by custom redirect
import { redirect } from "next/navigation";
export default function ProjectDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filters, setFilters] = useState({
    year: currentYear,
    month: currentMonth,
    userId: "", // Initialize with empty, will update when session loads
  });

  // Permissions check and redirect
  const isAdmin = session?.user?.role?.toLowerCase() === "admin";
  const hasProjectPermission = session?.user?.permissions?.includes("project");

  // Check permissions
  if (
    !isAdmin &&
    !hasProjectPermission
  ) {
    redirect("/"); // Redirect to home if no access
  }

  // Update filters when session loads
  useEffect(() => {
    if (session?.user) {
      const targetId =
        session.user.role?.toLowerCase() === "admin" ? "" : session.user.id;

      setFilters((prev) => {
        if (prev.userId !== targetId) {
          return { ...prev, userId: targetId };
        }
        return prev;
      });
    }
  }, [session]);

  // Hooks
  const {
    projects,
    workLogs,
    stats,
    loading: projectsLoading,
    fetchProjects,
    fetchWorkLogs,
    fetchDashboardStats,
  } = useProjects();

  const { users, fetchUsers } = useUsers();

  // Initial Data Fetch
  useEffect(() => {
    if (session) {
      if (session.user.role === "admin") {
        fetchUsers();
      }
      fetchProjects();
    }
  }, [session, fetchUsers, fetchProjects]);

  // Fetch Dashboard Data on filter change
  useEffect(() => {
    if (session) {
      const dashboardFilters = {
        year: filters.year,
        ...(filters.userId && { userId: filters.userId }),
      };

      const logFilters = {
        month: filters.month,
        year: filters.year,
        ...(filters.userId && { userId: filters.userId }),
      };

      fetchDashboardStats(dashboardFilters);
      fetchWorkLogs(logFilters);
    }
  }, [session, filters, fetchDashboardStats, fetchWorkLogs]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isLoading = projectsLoading && !stats;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Project Tracker
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Monitor your project progress and daily work
            </p>
          </div>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 whitespace-nowrap shrink-0"
          >
            <Plus className="w-5 h-5" />
            Work Log
          </button>
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
        {stats?.monthlyData ? (
          <div className="mb-6">
            <MonthlyChart data={stats.monthlyData} />
          </div>
        ) : null}

        {/* Recent Work Logs */}
        <WorkLogTable
          workLogs={workLogs.slice(0, 10)}
          formatDate={formatDate}
          loading={projectsLoading}
        />

        {/* Add Work Log Modal */}
        <AddWorkLogModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          onSuccess={() => {
            // Re-fetch data on success
            const dashboardFilters = {
              year: filters.year,
              ...(filters.userId && { userId: filters.userId }),
            };
            const logFilters = {
              month: filters.month,
              year: filters.year,
              ...(filters.userId && { userId: filters.userId }),
            };
            fetchDashboardStats(dashboardFilters);
            fetchWorkLogs(logFilters);
          }}
          projects={projects}
          users={users}
        />
      </div>
    </div>
  );
}
