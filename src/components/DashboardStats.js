import { DollarSign, FileText, Clock, TrendingUp } from "lucide-react";

export default function DashboardStats({
  filteredInvoices = [],
  allInvoices = [],
}) {
  // 1. Total Revenue (Filtered Period) - Corresponds to Income
  const totalInvoicesCount = filteredInvoices.length;
  const totalRevenue = filteredInvoices.reduce(
    (sum, inv) => sum + (inv.totalAmount || 0),
    0,
  );
  const paidInFiltered = filteredInvoices.filter(
    (inv) => inv.status === "Paid",
  );

  // 2. Pending Dues (Global/All-time) - Corresponds to Net Balance
  // Sum of (Total - Paid) for ALL invoices
  const pendingAmount = allInvoices.reduce(
    (sum, inv) => sum + ((inv.totalAmount || 0) - (inv.amountPaid || 0)),
    0,
  );
  // Count of invoices with any pending amount
  const pendingCount = allInvoices.filter((inv) => {
    const due = (inv.totalAmount || 0) - (inv.amountPaid || 0);
    return due > 0; // Floating point safety? Usually integers here but > 1 is safer if float issues. 0 is fine for now.
  }).length;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹ ${totalRevenue.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-green-600 dark:text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
      desc: "For selected period",
    },
    {
      title: "Pending Dues",
      value: `₹ ${pendingAmount.toLocaleString("en-IN")}`,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      desc: "Total outstanding stats",
    },
    {
      title: "Total Invoices",
      value: totalInvoicesCount,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      desc: "Generated in period",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                {stat.desc}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
