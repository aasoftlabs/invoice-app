"use client";

import React, { Fragment, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useModal } from "@/contexts/ModalContext";
import StatusBadge from "@/components/project/StatusBadge";
import {
  FolderKanban,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Plus,
  Check,
  X,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import AddProjectModal from "@/components/project/AddProjectModal";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const { confirm, alert } = useModal();
  const [projects, setProjects] = useState([]);
  const [projectTasks, setProjectTasks] = useState({});
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchProjects();
    }
  }, [session, fetchProjects]);

  const fetchProjectTasks = async (projectId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await res.json();
      if (data.success) {
        setProjectTasks((prev) => ({ ...prev, [projectId]: data.data }));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const toggleProject = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      if (!projectTasks[projectId]) {
        fetchProjectTasks(projectId);
      }
    }
    setExpandedProjects(newExpanded);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !(await confirm({
        title: "Delete Project",
        message:
          "Are you sure you want to delete this project? This will also delete all associated tasks and work logs.",
        variant: "danger",
        confirmText: "Delete",
      }))
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/projects?id=${projectId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await alert({
          title: "Success",
          message: "Project deleted successfully",
          variant: "success",
        });
        fetchProjects();
      } else {
        await alert({
          title: "Error",
          message: "Error: " + data.error,
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      await alert({
        title: "Error",
        message: "Error deleting project",
        variant: "danger",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "-";

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            <FolderKanban className="w-8 h-8 text-purple-600" />
            Projects
          </h1>
          <button
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all font-bold shadow-lg hover:shadow-purple-500/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-gray-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-4 text-center text-gray-500 dark:text-slate-400"
                  >
                    No projects found
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <React.Fragment key={project._id}>
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-slate-700 group cursor-pointer"
                      onClick={() => toggleProject(project._id)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-200 flex items-center gap-2">
                        {expandedProjects.has(project._id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        {project.client || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${project.completionPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            {project.completionPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-200">
                        {formatDate(project.startDate)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-slate-300">
                        {formatDate(project.endDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {project.refLink ? (
                          <a
                            href={project.refLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Link
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(session?.user?.role?.toLowerCase() === "admin" ||
                            project.projectManager?._id ===
                            session?.user?.id) && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditProject(project);
                                  }}
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                  title="Edit Project"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project._id);
                                  }}
                                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                                  title="Delete Project"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                    {expandedProjects.has(project._id) && (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50"
                        >
                          <div className="ml-8">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">
                              Tasks ({projectTasks[project._id]?.length || 0})
                            </h4>
                            {projectTasks[project._id] ? (
                              projectTasks[project._id].length > 0 ? (
                                <div className="space-y-3">
                                  {projectTasks[project._id].map((task) => (
                                    <div
                                      key={task._id}
                                      className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow"
                                    >
                                      <div className="flex items-start gap-4">
                                        {/* Status Icon */}
                                        <div className="mt-1">
                                          {task.status === "Completed" ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                          ) : task.status === "In Progress" ? (
                                            <div className="w-5 h-5 border-2 border-blue-500 rounded-full flex items-center justify-center">
                                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            </div>
                                          ) : (
                                            <XCircle className="w-5 h-5 text-gray-400" />
                                          )}
                                        </div>

                                        {/* Task Details */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm">
                                              {task.taskName}
                                            </h5>
                                            <StatusBadge status={task.status} />
                                          </div>

                                          {task.description && (
                                            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                                              {task.description}
                                            </p>
                                          )}

                                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-600 dark:text-slate-400">
                                            {task.assignedTo && (
                                              <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700 dark:text-slate-400">
                                                  Assigned to:
                                                </span>
                                                <span className="text-gray-900 dark:text-slate-200">
                                                  {task.assignedTo.name}
                                                </span>
                                              </div>
                                            )}
                                            {task.startDate && (
                                              <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700 dark:text-slate-400">
                                                  Started:
                                                </span>
                                                <span className="text-gray-900 dark:text-slate-200">
                                                  {formatDate(task.startDate)}
                                                </span>
                                              </div>
                                            )}
                                            {task.completedDate && (
                                              <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700 dark:text-slate-400">
                                                  Completed:
                                                </span>
                                                <span className="text-gray-900 dark:text-slate-200">
                                                  {formatDate(
                                                    task.completedDate,
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            {task.completedBy && (
                                              <div className="flex items-center gap-1">
                                                <span className="font-medium text-gray-700 dark:text-slate-400">
                                                  by
                                                </span>
                                                <span className="text-gray-900 dark:text-slate-200">
                                                  {task.completedBy.name}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">
                                  No tasks found for this project.
                                </p>
                              )
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Loading tasks...
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchProjects}
        editProject={editingProject}
      />
    </div>
  );
}
