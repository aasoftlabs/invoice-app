import { Filter, Search } from "lucide-react";

export default function GenerateFilters({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  searchTerm,
  setSearchTerm,
}) {
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mr-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
