"use client";

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    orange:
      "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  };

  const bgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">
          {title}
        </h3>
        {Icon && (
          <div className={`p-2 rounded-lg border ${bgClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
