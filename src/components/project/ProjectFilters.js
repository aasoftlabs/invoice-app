import { Filter } from "lucide-react";

export default function ProjectFilters({
  filters,
  setFilters,
  users,
  isAdmin,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mr-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Filter */}
          <select
            value={filters.month}
            onChange={(e) =>
              setFilters({ ...filters, month: parseInt(e.target.value) })
            }
            className="border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString("default", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={filters.year}
            onChange={(e) =>
              setFilters({ ...filters, year: parseInt(e.target.value) })
            }
            className="border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            {Array.from({ length: 6 }, (_, i) => 2025 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* User Filter (Admin Only) */}
          {isAdmin && (
            <select
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
              className="border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
