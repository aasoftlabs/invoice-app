import { Filter, Search } from "lucide-react";

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
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 mr-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium text-sm">Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 flex-1">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="with_salary">With Salary Structure</option>
            <option value="pending">Setup Pending</option>
          </select>

          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            <option value="all">All States</option>
            {uniqueStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            <option value="all">All Departments</option>
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <div className="relative flex-1 max-w-sm ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-gray-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
