import { CheckCircle, AlertCircle, Play } from "lucide-react";

export default function GenerateTable({
  employees,
  loading,
  lopData,
  setLopData,
  processing,
  handleGenerate,
  getSlipStatus,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b dark:border-slate-700">
          <tr>
            <th className="px-6 py-3">Employee</th>
            <th className="px-6 py-3">Gross Salary</th>
            <th className="px-6 py-3">Net Salary (Est.)</th>
            <th className="px-6 py-3 w-32">LOP Days</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
          {loading ? (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-8 text-center text-gray-500 dark:text-slate-400"
              >
                <div className="flex justify-center items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                  Loading...
                </div>
              </td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                No employees found
              </td>
            </tr>
          ) : (
            employees.map((emp) => {
              const slip = getSlipStatus(emp._id);
              const isProcessing = processing === emp._id;

              return (
                <tr
                  key={emp._id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {emp.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {emp.designation || "No Designation"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {emp.salary ? (
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        ₹{emp.salary.grossSalary?.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-xs text-red-500 italic">
                        No Salary Structure
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {emp.salary ? (
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        ₹{emp.salary.netSalary?.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={lopData[emp._id] || 0}
                      onChange={(e) =>
                        setLopData((prev) => ({
                          ...prev,
                          [emp._id]: e.target.value,
                        }))
                      }
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {slip ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" /> Generated
                      </span>
                    ) : !emp.salary ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                        <AlertCircle className="w-3 h-3" /> Setup Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {slip ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            window.open(`/payroll/slip/${slip._id}`, "_blank")
                          }
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleGenerate(emp._id)}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          Regenerate
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerate(emp._id)}
                        disabled={!emp.salary || isProcessing}
                        className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                        Generate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
