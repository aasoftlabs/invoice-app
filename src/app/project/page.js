"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/project/StatsCard";
import MonthlyChart from "@/components/project/MonthlyChart";
import StatusBadge from "@/components/project/StatusBadge";
import {
  CheckCircle,
  ListTodo,
  FolderKanban,
  User,
  Filter,
} from "lucide-react";

export default function ProjectDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

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
      fetchDashboardData();
      fetchWorkLogs();
      fetchProjects();
      fetchTasks();
      if (session.user.role === "admin") {
        fetchUsers();
      }
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

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (error) {
      console.error("Error:", error);
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
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 mr-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filters:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: parseInt(e.target.value) })
                }
                className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2024, month - 1).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: parseInt(e.target.value) })
                }
                className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ),
                )}
              </select>

              {session?.user?.role?.toLowerCase() === "admin" && (
                <select
                  value={filters.userId}
                  onChange={(e) =>
                    setFilters({ ...filters, userId: e.target.value })
                  }
                  className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                >
                  <option value="">All Users</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Current Project / Task
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Project</p>
              <p className="text-lg font-semibold text-blue-600">
                {stats?.currentActive?.project}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Task</p>
              <p className="text-lg font-semibold text-purple-600">
                {stats?.currentActive?.task}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Graph */}
        {stats?.monthlyData && (
          <div className="mb-6">
            <MonthlyChart data={stats.monthlyData} />
          </div>
        )}

        {/* Recent Work Logs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Work Logs
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No work logs found for the selected period
                    </td>
                  </tr>
                ) : (
                  workLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.projectId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.taskId?.taskName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.remarks || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
