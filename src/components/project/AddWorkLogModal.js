"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, FileText, CheckCircle } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";

export default function AddWorkLogModal({
  isOpen,
  onClose,
  onSuccess,
  projects,
  users,
  editLog = null,
}) {
  const { alert } = useModal();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    projectId: "",
    taskId: "",
    details: "",
    status: "In Progress",
    remarks: "",
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editLog) {
      setFormData({
        date: editLog.date
          ? new Date(editLog.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        projectId: editLog.projectId?._id || "",
        taskId: editLog.taskId?._id || "",
        details: editLog.details || "",
        status: editLog.status || "In Progress",
        remarks: editLog.remarks || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        projectId: "",
        taskId: "",
        details: "",
        status: "In Progress",
        remarks: "",
      });
    }
  }, [editLog, isOpen]);

  useEffect(() => {
    if (isOpen && projects.length > 0) {
      fetchTasks();
    }
  }, [isOpen, projects]);

  useEffect(() => {
    if (formData.projectId) {
      const projectTasks = tasks.filter(
        (t) => t.projectId?._id === formData.projectId,
      );
      setFilteredTasks(projectTasks);
    } else {
      setFilteredTasks([]);
    }
  }, [formData.projectId, tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editLog ? `/api/worklogs?id=${editLog._id}` : "/api/worklogs";
      const method = editLog ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        await alert({
          title: "Success",
          message: editLog
            ? "Work log updated successfully!"
            : "Work log created successfully!",
          variant: "success",
        });
        setFormData({
          date: new Date().toISOString().split("T")[0],
          projectId: "",
          taskId: "",
          details: "",
          status: "In Progress",
          remarks: "",
        });
        onSuccess();
        onClose();
      } else {
        await alert({
          title: "Error",
          message: "Error: " + data.error,
          variant: "danger",
        });
      }
    } catch (error) {
      console.error(
        editLog ? "Error updating work log:" : "Error creating work log:",
        error,
      );
      await alert({
        title: "Error",
        message: editLog ? "Error updating work log" : "Error creating work log",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editLog ? "Edit" : "Add"} Work Log Entry
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    taskId: "",
                  })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Task *
              </label>
              <select
                value={formData.taskId}
                onChange={(e) =>
                  setFormData({ ...formData, taskId: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={!formData.projectId}
              >
                <option value="">Select Task</option>
                {filteredTasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.taskName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Work Details *
              </label>
              <textarea
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                rows={4}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe what you worked on..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                rows={2}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Additional notes (optional)..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading
                ? "Creating..."
                : editLog
                  ? "Update Work Log"
                  : "Create Work Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
