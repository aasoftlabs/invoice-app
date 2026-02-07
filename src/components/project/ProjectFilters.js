import { Filter } from "lucide-react";
import Select from "@/components/ui/Select";

export default function ProjectFilters({
  filters,
  setFilters,
  users,
  isAdmin,
}) {
  const currentYear = new Date().getFullYear();

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
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mr-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Filter */}
          <div className="w-40">
            <Select
              value={filters.month}
              onChange={(e) =>
                setFilters({ ...filters, month: parseInt(e.target.value) })
              }
              options={monthOptions}
            />
          </div>

          {/* Year Filter */}
          <div className="w-32">
            <Select
              value={filters.year}
              onChange={(e) =>
                setFilters({ ...filters, year: parseInt(e.target.value) })
              }
              options={yearOptions}
            />
          </div>

          {/* User Filter (Admin Only) */}
          {isAdmin ? <div className="w-48">
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
