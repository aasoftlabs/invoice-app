"use client";

import { useState, useEffect } from "react";
import { X, Calendar, User, ListTodo } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";

export default function AddTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projects,
  users,
  editTask = null,
}) {
  const { alert } = useModal();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    taskName: "",
    description: "",
    status: "Not Started",
    assignedTo: "",
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        projectId: editTask.projectId?._id || editTask.projectId || "",
        taskName: editTask.taskName || "",
        description: editTask.description || "",
        status: editTask.status || "Not Started",
        assignedTo: editTask.assignedTo?._id || editTask.assignedTo || "",
      });
    } else {
      setFormData({
        projectId: "",
        taskName: "",
        description: "",
        status: "Not Started",
        assignedTo: "",
      });
    }
  }, [editTask, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up data: remove assignedTo if empty (can't cast empty string to ObjectId)
      const submitData = { ...formData };
      if (!submitData.assignedTo) {
        delete submitData.assignedTo;
      }

      const isEditing = !!editTask;
      const res = await fetch("/api/tasks", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditing ? { id: editTask._id, ...submitData } : submitData,
        ),
      });

      const data = await res.json();
      if (data.success) {
        await alert({
          title: "Success",
          message: editTask
            ? "Task updated successfully!"
            : "Task created successfully!",
          variant: "success",
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
      console.error("Error creating task:", error);
      await alert({
        title: "Error",
        message: "Error creating task",
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
            {editTask ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Project *
              </label>
              <select
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={formData.taskName}
                onChange={(e) =>
                  setFormData({ ...formData, taskName: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Status *
              </label>
              <input
                type="text"
                value="Not Started"
                disabled
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-400 bg-gray-100 dark:bg-slate-900/50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Assigned To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-gray-900 dark:text-slate-200 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Not Assigned</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
