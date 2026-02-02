"use client";

export default function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-700 dark:text-green-400",
          border: "border-green-200 dark:border-green-800/50",
          label: "Completed",
        };
      case "In Progress":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-700 dark:text-yellow-400",
          border: "border-yellow-200 dark:border-yellow-800/50",
          label: "In Progress",
        };
      case "Follow-up":
        return {
          bg: "bg-orange-100 dark:bg-orange-900/30",
          text: "text-orange-700 dark:text-orange-400",
          border: "border-orange-200 dark:border-orange-800/50",
          label: "Follow-up",
        };
      case "Not Started":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-700 dark:text-red-400",
          border: "border-red-200 dark:border-red-800/50",
          label: "Not Started",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-slate-700",
          text: "text-gray-700 dark:text-slate-300",
          border: "border-gray-200 dark:border-slate-600",
          label: status || "N/A",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}
