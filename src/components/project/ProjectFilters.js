import { Filter, X } from "lucide-react";
import Select from "@/components/ui/Select";

export default function ProjectFilters({
  filters,
  setFilters,
  users,
  isAdmin,
}) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const clearFilters = () => {
    setFilters({
      month: currentMonth,
      year: currentYear,
      userId: "",
    });
  };

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1).map(
    (month) => ({
      value: month,
      label: new Date(2024, month - 1).toLocaleString("default", {
        month: "long",
      }),
    }),
  );

  const yearOptions = Array.from({ length: 6 }, (_, i) => 2025 + i).map(
    (year) => ({
      value: year,
      label: year.toString(),
    }),
  );

  const userOptions = [
    { value: "", label: "All Users" },
    ...users.map((user) => ({
      value: user._id,
      label: user.name,
    })),
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
        <div className="flex items-center justify-between gap-2 text-gray-700 dark:text-slate-300 mr-2 mb-2 sm:mb-0 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">Filters:</span>
          </div>
          {/* Clear Button */}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer active:scale-95 ml-2"
            title="Reset to default filters"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            {/* Month Filter */}
            <div className="flex-1 sm:w-40">
              <Select
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: parseInt(e.target.value) })
                }
                options={monthOptions}
              />
            </div>

            {/* Year Filter */}
            <div className="flex-1 sm:w-32">
              <Select
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: parseInt(e.target.value) })
                }
                options={yearOptions}
              />
            </div>
          </div>

          {/* User Filter (Admin Only) */}
          {isAdmin ? <div className="w-full sm:w-48">
            <Select
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
              options={userOptions}
            />
          </div> : null}
        </div>
      </div>
    </div>
  );
}
