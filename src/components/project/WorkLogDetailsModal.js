"use client";

import { X, Calendar, FileText, MessageSquare } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function WorkLogDetailsModal({ isOpen, onClose, workLog }) {
  if (!isOpen || !workLog) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Work Log Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
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
          {workLog.remarks && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Remarks
              </label>
              <p className="text-gray-900 dark:text-slate-200 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg whitespace-pre-wrap">
                {workLog.remarks}
              </p>
            </div>
          )}

          {/* User Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Logged By
            </label>
            <p className="text-gray-900 dark:text-slate-200">
              {workLog.userId?.name || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
