import {
  CheckCircle,
  AlertCircle,
  Play,
  Lock,
  Unlock,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function GenerateTable({
  employees,
  loading,
  lopData,
  liveLopData,
  setLopData,
  processing,
  handleGenerate,
  getSlipStatus,
}) {
  const router = useRouter();
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block overflow-x-auto no-scrollbar">
        <table className="w-full text-left min-w-max">
          <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">Gross Salary</th>
              <th className="px-6 py-3">Net Salary (Est.)</th>
              <th className="px-6 py-3 w-32">LOP Days</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Payment Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-gray-500 dark:text-slate-400"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
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
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="31"
                          value={lopData[emp._id]?.value || 0}
                          readOnly={!lopData[emp._id]?.isManual}
                          onChange={(e) =>
                            setLopData((prev) => ({
                              ...prev,
                              [emp._id]: {
                                ...prev[emp._id],
                                value: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className={`w-16 px-2 py-1 border rounded text-sm ${
                            lopData[emp._id]?.isManual
                              ? "border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                          }`}
                        />
                        <button
                          onClick={() =>
                            setLopData((prev) => ({
                              ...prev,
                              [emp._id]: {
                                ...prev[emp._id],
                                isManual: !prev[emp._id]?.isManual,
                              },
                            }))
                          }
                          className={`p-1 rounded-md transition-colors ${
                            lopData[emp._id]?.isManual
                              ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700"
                          }`}
                          title={
                            lopData[emp._id]?.isManual
                              ? "Switch to Automatic"
                              : "Edit Manually"
                          }
                        >
                          {lopData[emp._id]?.isManual ? (
                            <Unlock className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {/* Sync Warning */}
                      {liveLopData &&
                      liveLopData[emp._id] !== undefined &&
                      liveLopData[emp._id] !==
                        (lopData[emp._id]?.value || 0) ? (
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 dark:text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          <span>Actual: {liveLopData[emp._id]}</span>
                          <button
                            onClick={() =>
                              setLopData((prev) => ({
                                ...prev,
                                [emp._id]: {
                                  value: liveLopData[emp._id],
                                  isManual: false, // Reset to auto mode
                                },
                              }))
                            }
                            className="ml-1 underline hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
                          >
                            Sync
                          </button>
                        </div>
                      ) : null}
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
                    <td className="px-6 py-4">
                      {slip ? (
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                            slip.status === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : slip.status === "finalized"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {slip.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {slip ? (
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() =>
                              router.push(`/payroll/slip/${slip._id}`)
                            }
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all cursor-pointer active:scale-95"
                            title="View Slip"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleGenerate(emp._id)}
                            disabled={isProcessing}
                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-sm shadow-blue-500/20"
                            title="Regenerate Slip"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGenerate(emp._id)}
                          disabled={!emp.salary || isProcessing}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-sm shadow-blue-500/20 ml-auto flex"
                          title="Generate Slip"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
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

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            <div className="flex justify-center items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
              Loading...
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No employees found
          </div>
        ) : (
          employees.map((emp) => {
            const slip = getSlipStatus(emp._id);
            const isProcessing = processing === emp._id;

            return (
              <div
                key={emp._id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {emp.name}
                    </h3>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {emp.designation || "No Designation"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {slip ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-2.5 h-2.5" /> Generated
                      </span>
                    ) : !emp.salary ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-2.5 h-2.5" /> Setup Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
                        Pending
                      </span>
                    )}
                    {slip && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          slip.status === "paid"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                            : slip.status === "finalized"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400"
                        }`}
                      >
                        {slip.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">
                      Gross Salary
                    </div>
                    <div className="text-sm font-bold text-gray-700 dark:text-slate-200">
                      {emp.salary
                        ? `₹${emp.salary.grossSalary?.toLocaleString("en-IN")}`
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-0.5">
                      Net (Est.)
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {emp.salary
                        ? `₹${emp.salary.netSalary?.toLocaleString("en-IN")}`
                        : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-slate-700/50">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mb-1.5 ml-1">
                      LOP Days
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="31"
                        value={lopData[emp._id]?.value || 0}
                        readOnly={!lopData[emp._id]?.isManual}
                        onChange={(e) =>
                          setLopData((prev) => ({
                            ...prev,
                            [emp._id]: {
                              ...prev[emp._id],
                              value: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        className={`w-full max-w-[80px] px-3 py-2 border rounded-xl font-bold text-sm ${
                          lopData[emp._id]?.isManual
                            ? "border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ring-2 ring-blue-500/10"
                            : "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-900 text-gray-500 dark:text-slate-400 cursor-not-allowed"
                        }`}
                      />
                      <button
                        onClick={() =>
                          setLopData((prev) => ({
                            ...prev,
                            [emp._id]: {
                              ...prev[emp._id],
                              isManual: !prev[emp._id]?.isManual,
                            },
                          }))
                        }
                        className={`p-2 rounded-xl transition-all shadow-sm ${
                          lopData[emp._id]?.isManual
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                            : "bg-white dark:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 border border-gray-200 dark:border-slate-600"
                        }`}
                      >
                        {lopData[emp._id]?.isManual ? (
                          <Unlock className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </button>

                      {liveLopData &&
                        liveLopData[emp._id] !== undefined &&
                        liveLopData[emp._id] !==
                          (lopData[emp._id]?.value || 0) && (
                          <button
                            onClick={() =>
                              setLopData((prev) => ({
                                ...prev,
                                [emp._id]: {
                                  value: liveLopData[emp._id],
                                  isManual: false,
                                },
                              }))
                            }
                            className="flex items-center gap-1.5 px-2 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold animate-pulse hover:animate-none border border-amber-100 dark:border-amber-800/50 transition-colors"
                          >
                            <AlertCircle className="w-3 h-3" />
                            Sync ({liveLopData[emp._id]})
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-1 mt-2">
                  {slip && (
                    <button
                      onClick={() => router.push(`/payroll/slip/${slip._id}`)}
                      className="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800 transition-colors cursor-pointer active:scale-95 bg-white dark:bg-slate-800 shadow-sm"
                      title="View Slip"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleGenerate(emp._id)}
                    disabled={!emp.salary || isProcessing}
                    className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95 shadow-lg shadow-blue-500/20"
                    title={slip ? "Regenerate Slip" : "Generate Slip"}
                  >
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
