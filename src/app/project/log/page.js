"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useModal } from "@/contexts/ModalContext";
import StatusBadge from "@/components/project/StatusBadge";
import { ListTodo, Plus, Trash2, Pencil, Filter, Loader2 } from "lucide-react";
import AddWorkLogModal from "@/components/project/AddWorkLogModal";
import WorkLogDetailsModal from "@/components/project/WorkLogDetailsModal";
import { useProjects } from "@/hooks/useProjects";

export default function WorkLogPage() {
  const { data: session, status } = useSession();
  const { confirm, alert } = useModal();

  // Hook Integration
  const {
    workLogs,
    projects,
    loading: projectsLoading, // Optional global loading
    fetchWorkLogs,
    fetchProjects,
    deleteWorkLog,
  } = useProjects();

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [viewingLog, setViewingLog] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Observer for infinite scroll
  const observer = useRef();
  const lastLogElementRef = useCallback(
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

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [filters, setFilters] = useState({
    projectId: "",
    month: currentMonth,
    year: currentYear,
  });

  const handleDeleteLog = async (logId) => {
    if (
      !(await confirm({
        title: "Delete Work Log",
        message: "Are you sure you want to delete this work log?",
        variant: "danger",
        confirmText: "Delete",
      }))
    ) {
      return;
    }

    const result = await deleteWorkLog(logId);

    if (result.success) {
      await alert({
        title: "Success",
        message: "Work log deleted successfully!",
        variant: "success",
      });
      // Refresh
      setPage(1);
      fetchWorkLogs({
        ...filters,
        page: 1,
        limit: 20,
      });
    } else {
      await alert({
        title: "Error",
        message: "Error: " + (result.error || "Failed to delete"),
        variant: "danger",
      });
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

  // Initial Data Fetch
  useEffect(() => {
    if (session) {
      Promise.resolve().then(() => {
        setLoading(true);
        fetchProjects(); // Fetches all projects for the filter dropdown
        setPage(1);

        const params = {
          ...filters,
          page: 1,
          limit: 20,
        };

        fetchWorkLogs(params).then((data) => {
          setLoading(false);
          if (data?.data?.length < 20) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        });
      });
    }
  }, [session, filters, fetchProjects, fetchWorkLogs]);

  // Load More
  useEffect(() => {
    if (page > 1) {
      Promise.resolve().then(() => setLoadingMore(true));
      const params = {
        ...filters,
        page: page,
        limit: 20,
      };

      fetchWorkLogs(params).then((data) => {
        setLoadingMore(false);
        if (data?.data?.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [page, fetchWorkLogs, filters]); // filters not needed here as page change implies same filters

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Daily Work Log
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Work Log
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mr-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filters:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: parseInt(e.target.value) })
                }
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
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
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
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
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
              <ListTodo className="w-5 h-5 text-blue-600" />
              Work Log History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {loading && workLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : workLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                    >
                      No work logs found. Start by creating your first log!
                    </td>
                  </tr>
                ) : (
                  workLogs.map((log, index) => (
                    <tr
                      key={log._id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 group cursor-pointer"
                      ref={
                        index === workLogs.length - 1 ? lastLogElementRef : null
                      }
                      onClick={() => handleViewLog(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                        {formatDate(log.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                        {log.projectId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-200">
                        {log.taskId?.taskName || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-300">
                        {log.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
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
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
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
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
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

        {loadingMore ? (
          <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading more logs...
          </div>
        ) : null}
      </div>

      <AddWorkLogModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          setPage(1);
          fetchWorkLogs({
            ...filters,
            page: 1,
            limit: 20,
          });
        }}
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
