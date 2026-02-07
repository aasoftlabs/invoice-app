import { Calendar, FileText, MessageSquare } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function WorkLogDetailsModal({ isOpen, onClose, workLog }) {
  if (!workLog) return null;

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
      title="Work Log Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Date */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </label>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDate(workLog.date)}
          </p>
        </div>

        {/* Project and Task */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Project
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {workLog.projectId?.name || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Task
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {workLog.taskId?.taskName || "N/A"}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Status
          </label>
          <StatusBadge status={workLog.status} />
        </div>

        {/* Work Details */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Work Details
          </label>
          <p className="text-gray-900 dark:text-slate-200 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
            {workLog.details}
          </p>
        </div>

        {/* Remarks */}
        {workLog.remarks ? <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Remarks
            </label>
            <p className="text-gray-900 dark:text-slate-200 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
              {workLog.remarks}
            </p>
          </div> : null}

        {/* User Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Logged By
          </label>
          <p className="text-gray-900 dark:text-slate-200">
            {workLog.userId?.name || "N/A"}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
