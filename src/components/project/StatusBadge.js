"use client";

export default function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-200",
          label: "Completed",
        };
      case "In Progress":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          label: "In Progress",
        };
      case "Follow-up":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-200",
          label: "Follow-up",
        };
      case "Not Started":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          label: "Not Started",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          border: "border-gray-200",
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
