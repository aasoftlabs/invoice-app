"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useModal } from "@/contexts/ModalContext";
import StatusBadge from "@/components/project/StatusBadge";
import {
  ListTodo,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";
import AddTaskModal from "@/components/project/AddTaskModal";
import TaskDetailsModal from "@/components/project/TaskDetailsModal";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";

export default function TasksPage() {
  const { data: session, status } = useSession();
  const { confirm, alert } = useModal();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Replaced local fetching with hooks
  const {
    tasks,
    projects,
    loading: projectsLoading, // Global loading state from hook
    fetchTasks,
    fetchProjects,
    deleteTask,
  } = useProjects();

  const { users, fetchUsers } = useUsers();

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Observer for infinite scroll
  const observer = useRef();
  const lastTaskElementRef = useCallback(
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

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ projectId: "", status: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Initial Fetch
  useEffect(() => {
    if (session) {
      Promise.resolve().then(() => {
        setLoading(true);
        fetchProjects();
        fetchUsers();

        const fetchParams = {
          ...filters,
          page: 1,
          limit: 20,
        };

        fetchTasks(fetchParams).then((data) => {
          setLoading(false);
          if (data?.data?.length < 20) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        });
      });
    }
  }, [filters, session, fetchProjects, fetchTasks, fetchUsers]);

  // Load More
  useEffect(() => {
    if (page > 1) {
      Promise.resolve().then(() => setLoadingMore(true));
      const fetchParams = {
        ...filters,
        page: page,
        limit: 20,
      };

      fetchTasks(fetchParams).then((data) => {
        setLoadingMore(false);
        if (data?.data?.length < 20) {
          setHasMore(false);
        }
      });
    }
  }, [page, filters, fetchTasks]);

  const filteredTasks = tasks.filter(
    (task) =>
      task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (
      !(await confirm({
        title: "Delete Task",
        message:
          "Are you sure you want to delete this task? This will also delete all associated work logs.",
        variant: "danger",
        confirmText: "Delete",
      }))
    ) {
      return;
    }

    const result = await deleteTask(taskId);

    if (result.success) {
      await alert({
        title: "Success",
        message: "Task deleted successfully!",
        variant: "success",
      });
      // Refresh tasks
      setPage(1);
      fetchTasks({ ...filters, page: 1, limit: 20 });
    } else {
      await alert({
        title: "Error",
        message: "Error: " + result.error,
        variant: "danger",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-8 h-8 text-blue-600" />
            Tasks
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-blue-500/20"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mr-2">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filters:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 grow">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-gray-50 dark:bg-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-600 transition-colors"
                />
              </div>

              <select
                value={filters.projectId}
                onChange={(e) =>
                  setFilters({ ...filters, projectId: e.target.value })
                }
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Completed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {loading && tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                    >
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => (
                    <tr
                      key={task._id}
                      ref={
                        index === filteredTasks.length - 1
                          ? lastTaskElementRef
                          : null
                      }
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 group cursor-pointer"
                      onClick={() => handleViewTask(task)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        {task.projectId?.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                        {task.taskName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {task.description || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        {formatDate(task.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        {formatDate(task.completedDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        {task.completedBy?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(task);
                            }}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {session?.user?.role === "admin" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task._id);
                              }}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete task"
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

      {loadingMore ? (
        <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading more tasks...
        </div>
      ) : null}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={() => {
          setPage(1);
          fetchTasks({ ...filters, page: 1, limit: 20 });
          handleCloseModal();
        }}
        projects={projects}
        users={users}
        editTask={editingTask}
      />
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setViewingTask(null);
        }}
        task={viewingTask}
      />
    </div>
  );
}
