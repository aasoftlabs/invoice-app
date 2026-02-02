import { Users, DollarSign, TrendingDown, Wallet } from "lucide-react";

export default function PayrollStats({ employees }) {
  // Calculate summary statistics
  const totalEmployees = employees.length;
  const employeesWithSalary = employees.filter((e) => e.salary).length;
  const totalMonthlyPayroll = employees.reduce(
    (sum, e) => sum + (e.salary?.grossSalary || 0),
    0,
  );
  const totalDeductions = employees.reduce(
    (sum, e) => sum + (e.salary?.totalDeductions || 0),
    0,
  );
  const totalNetPayable = employees.reduce(
    (sum, e) => sum + (e.salary?.netSalary || 0),
    0,
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Total Employees
            </p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
              {totalEmployees}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              {employeesWithSalary} with salary structure
            </p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Monthly Payroll
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {formatCurrency(totalMonthlyPayroll)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Gross salary total
            </p>
          </div>
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Total Deductions
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {formatCurrency(totalDeductions)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              PF, ESI, PT, TDS
            </p>
          </div>
          <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              Net Payable
            </p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
              {formatCurrency(totalNetPayable)}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              After all deductions
            </p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
            <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
