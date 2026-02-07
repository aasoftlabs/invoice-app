import { Calculator } from "lucide-react";

export default function SalaryPreview({ estimate }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 lg:sticky lg:top-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        Monthly Estimate
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center pb-4 border-b dark:border-slate-700">
          <span className="text-gray-600 dark:text-slate-400">
            Gross Salary
          </span>
          <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
            ₹{estimate.gross.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-500 dark:text-slate-400 pb-4 border-b dark:border-slate-700">
          <div className="flex justify-between">
            <span>PF (12%)</span>
            <span>₹{estimate.pf}</span>
          </div>
          <div className="flex justify-between">
            <span>ESI (0.75%)</span>
            <span>₹{estimate.esi}</span>
          </div>
          <div className="flex justify-between">
            <span>PT (Est.)</span>
            <span>₹{estimate.pt}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pb-4 border-b">
          <span className="text-gray-600 dark:text-slate-400">
            Total Deductions
          </span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            -₹{estimate.deductions.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="font-bold text-gray-800 dark:text-white">
            Net Salary
          </span>
          <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">
            ₹{estimate.net.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 p-3 rounded-lg text-xs mt-4">
          Note: This is an estimate. TDS and precise statutory deductions will
          be calculated exactly when generating the salary slip.
        </div>
      </div>
    </div>
  );
}
