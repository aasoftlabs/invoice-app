import { Calendar, User, CheckCircle, FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function TaskDetailsModal({ isOpen, onClose, task }) {
  if (!task) return null;

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "-";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Project and Task Name */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {task.taskName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Project: {task.projectId?.name}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Status
          </label>
          <StatusBadge status={task.status} />
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <p className="text-gray-900 dark:text-slate-200 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg">
              {task.description}
            </p>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {formatDate(task.startDate)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed Date
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {formatDate(task.completedDate)}
            </p>
          </div>
        </div>

        {/* Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Assigned To
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {task.assignedTo?.name || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Completed By
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {task.completedBy?.name || "-"}
            </p>
          </div>
        </div>

        {/* Remarks */}
        {task.remarks && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Remarks
            </label>
            <p className="text-gray-900 dark:text-slate-200 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg">
              {task.remarks}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
