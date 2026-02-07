import { Filter, Search, X } from "lucide-react";

export default function GenerateFilters({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  searchTerm,
  setSearchTerm,
}) {
  const clearFilters = () => {
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    setSearchTerm("");
  };
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex items-center justify-between gap-2 text-gray-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 dark:bg-slate-700 p-1.5 rounded-lg">
              <Filter className="w-4 h-4 text-blue-500" />
            </div>
            <span className="font-bold text-sm">Filters</span>
          </div>

          <button
            onClick={clearFilters}
            className="text-[10px] sm:text-xs flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all cursor-pointer active:scale-95 border border-red-100 dark:border-red-800/50"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="h-4 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block mx-1" />

        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
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
              className="border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px] sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-slate-800 transition-all text-gray-900 dark:text-white placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
