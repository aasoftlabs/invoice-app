import { Filter, Search, X } from "lucide-react";

export default function PayrollFilters({
  filterStatus,
  setFilterStatus,
  filterState,
  setFilterState,
  filterDepartment,
  setFilterDepartment,
  searchTerm,
  setSearchTerm,
  uniqueStates = [],
  uniqueDepartments = [],
}) {
  const clearFilters = () => {
    setFilterStatus("all");
    setFilterState("all");
    setFilterDepartment("all");
    setSearchTerm("");
  };

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
            className="text-xs flex items-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer active:scale-95"
            title="Reset to default filters"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:flex-1">
          <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer w-full"
            >
              <option value="all">Status</option>
              <option value="with_salary">Active</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer w-full"
            >
              <option value="all">States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-2 md:px-3 py-1.5 text-xs md:text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer w-full"
            >
              <option value="all">Depts</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full md:w-auto md:ml-auto">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
