import { Users, DollarSign, TrendingDown, Wallet } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";

export default function PayrollStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-32 animate-pulse"
           />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Spotlight className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Total Employees
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              {stats.totalEmployees}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              {stats.employeesWithSalary} with salary structure
            </p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Spotlight>

      <Spotlight className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Monthly Payroll
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {formatCurrency(stats.totalMonthlyPayroll)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Gross salary total
            </p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Spotlight>

      <Spotlight className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Total Deductions
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {formatCurrency(stats.totalDeductions)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              PF, ESI, PT, TDS
            </p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Spotlight>

      <Spotlight className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 cursor-pointer group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Net Payable
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {formatCurrency(stats.totalNetPayable)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              After all deductions
            </p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Spotlight>
    </div>
  );
}
