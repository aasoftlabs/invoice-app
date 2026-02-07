import { Edit, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PayrollTable({
  employees,
  loading,
  error,
  lastElementRef,
}) {
  const router = useRouter();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Desktop Table View */}
      <table className="w-full text-left hidden md:table">
        <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b dark:border-slate-700">
          <tr>
            <th className="px-6 py-3">Employee</th>
            <th className="px-6 py-3">Emp Code</th>
            <th className="px-6 py-3">Department</th>
            <th className="px-6 py-3">DOJ</th>
            <th className="px-6 py-3">State</th>
            <th className="px-6 py-3">Gross Salary</th>
            <th className="px-6 py-3">Deductions</th>
            <th className="px-6 py-3">Net Salary</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {loading ? (
            <tr>
              <td
                colSpan="9"
                className="px-6 py-8 text-center text-gray-500 dark:text-slate-400"
              >
                Loading employees...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="9" className="px-6 py-8 text-center text-red-500">
                Error: {error}
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((emp, index) => (
              <tr
                key={emp._id}
                ref={index === employees.length - 1 ? lastElementRef : null}
                className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {emp.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {emp.email}
                  </div>
                  {emp.designation ? (
                    <div className="text-xs text-gray-400 italic">
                      {emp.designation}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {emp.employeeId || (
                      <span className="text-gray-400 italic text-xs">
                        Not Set
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {emp.department || "General"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {emp.joiningDate ? (
                      new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    ) : (
                      <span className="text-gray-400 italic text-xs">
                        Not Set
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    {emp.salary?.state || emp.state || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {emp.salary ? (
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(emp.salary.grossSalary)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Not set
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {emp.salary ? (
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {formatCurrency(emp.salary.totalDeductions)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {emp.salary ? (
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(emp.salary.netSalary)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/payroll/salary/${emp._id}`)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer active:scale-90"
                      title="Edit salary structure"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/payroll/slips?userId=${emp._id}`)
                      }
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors cursor-pointer active:scale-90"
                      title="View salary slips"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            Loading employees...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No employees found
          </div>
        ) : (
          employees.map((emp, index) => (
            <div
              key={emp._id}
              ref={index === employees.length - 1 ? lastElementRef : null}
              className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {emp.name}
                  </h3>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {emp.designation || "No Designation"} •{" "}
                    {emp.department || "General"}
                  </div>
                </div>
                {emp.salary && (
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400 text-sm">
                      {formatCurrency(emp.salary.netSalary)}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                      Net Pay
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-slate-400 mb-3 bg-gray-50 dark:bg-slate-700/30 p-2 rounded">
                <div>
                  <span className="text-gray-400">Emp ID:</span>{" "}
                  {emp.employeeId || "N/A"}
                </div>
                <div>
                  <span className="text-gray-400">DOJ:</span>{" "}
                  {emp.joiningDate
                    ? new Date(emp.joiningDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                    : "N/A"}
                </div>
                <div>
                  <span className="text-gray-400">Gross:</span>{" "}
                  {emp.salary
                    ? formatCurrency(emp.salary.grossSalary)
                    : "Not Set"}
                </div>
                <div>
                  <span className="text-gray-400">State:</span>{" "}
                  {emp.salary?.state || emp.state || "N/A"}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-3">
                <button
                  onClick={() => router.push(`/payroll/salary/${emp._id}`)}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all"
                >
                  <Edit className="w-3.5 h-3.5" /> Structure
                </button>
                <button
                  onClick={() =>
                    router.push(`/payroll/slips?userId=${emp._id}`)
                  }
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 active:scale-95 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> Slips
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
