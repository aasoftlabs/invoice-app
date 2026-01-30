"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import StatusBadge from "@/components/project/StatusBadge";
import { Calendar, ListTodo, Plus, Trash2, Pencil, Filter } from "lucide-react";
import AddWorkLogModal from "@/components/project/AddWorkLogModal";
import WorkLogDetailsModal from "@/components/project/WorkLogDetailsModal";

export default function WorkLogPage() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [filters, setFilters] = useState({
    projectId: "",
    month: currentMonth,
    year: currentYear,
  });

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  const fetchWorkLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.projectId && { projectId: filters.projectId }),
        month: filters.month,
        year: filters.year,
      });
      const res = await fetch(`/api/worklogs?${params}`);
      const data = await res.json();
      if (data.success) {
        setWorkLogs(data.data);
      }
    } catch (error) {
      console.error("Error fetching work logs:", error);
    }
  }, [filters]);


  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this work log?")) {
      return;
    }

    try {
      const res = await fetch(`/api/worklogs?id=${logId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success) {
        alert("Work log deleted successfully!");
        fetchWorkLogs();
      } else {
        alert("Error: " + (data.error || "Failed to delete"));
      }
    } catch (error) {
      console.error("Error deleting work log:", error);
      alert("Error deleting work log");
    }
  };

  const handleViewLog = (log) => {
    setViewingLog(log);
    setIsDetailsModalOpen(true);
  };

  const handleEditLog = (log) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLog(null);
  };

  useEffect(() => {
    if (session) {
      Promise.resolve().then(() => {
        fetchProjects();
        fetchWorkLogs();
      });
    }
  }, [session, filters, fetchProjects, fetchWorkLogs]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-full bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Work Log</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Work Log
          </button>
        </div>

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
                className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
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
                className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(
                  (year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ),
                )}
              </select>

              <select
                value={filters.projectId}
                onChange={(e) =>
                  setFilters({ ...filters, projectId: e.target.value })
                }
                className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Work Log History */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-purple-600" />
              Work Log History
            </h2>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No work logs found. Start by creating your first log!
                    </td>
                  </tr>
                ) : (
                  workLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 group cursor-pointer"
                      onClick={() => handleViewLog(log)}
                    >
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
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit button - only show for log creator */}
                          {log.userId?._id === session?.user?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLog(log);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit work log"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {/* Delete button - show for log creator or admin */}
                          {(log.userId?._id === session?.user?.id ||
                            session?.user?.role === "admin") && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLog(log._id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete work log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AddWorkLogModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchWorkLogs}
        projects={projects}
        editLog={editingLog}
      />
      <WorkLogDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingLog(null);
        }}
        workLog={viewingLog}
      />
    </div>
  );
}
