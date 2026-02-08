import { Filter, Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function AccountFilters({ filters, setFilters }) {
  const currentYear = new Date().getFullYear();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  const clearFilters = () => {
    setFilters({
      month: new Date().getMonth() + 1,
      year: currentYear,
      type: "all",
      search: "",
    });
    setSearchTerm("");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, setFilters]);

  // Sync local state if parent filter changes externally (e.g. clear filters)
  // useEffect removed to prevent sync state update loop. Relying on clearFilters to update both.

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center justify-between w-full md:w-auto gap-2 text-gray-700 dark:text-slate-300 mr-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">Filters:</span>
          </div>

          {/* Clear Button */}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            title="Reset to default filters"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Month Filter */}
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Months</option>
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
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Years</option>
            {Array.from({ length: 6 }, (_, i) => 2025 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 hover:bg-white dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Credit">Credit (Income)</option>
            <option value="Debit">Debit (Expense)</option>
          </select>

          {/* Search Input */}
          <div className="relative w-full md:w-auto">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 transition-all"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
