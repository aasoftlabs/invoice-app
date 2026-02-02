
import { Wallet, Building, CreditCard, Shield, FileText } from "lucide-react";

export default function SalaryDetails({ salary, loading }) {
    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading salary details...</div>;
    }

    if (!salary) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Wallet className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No Salary Structure
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2">
                    Your salary structure has not been defined yet. Contact HR/Admin.
                </p>
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
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-cyan-600" />
                Salary & Financial Details
            </h2>

            {/* Bank & Tax Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Building className="w-4 h-4 text-gray-400" /> Bank Details
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400 block">
                                Bank Name
                            </label>
                            <div className="font-medium text-gray-900 dark:text-white">
                                {salary.bankName || "N/A"}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400 block">
                                Account Number
                            </label>
                            <div className="font-medium text-gray-900 dark:text-white font-mono">
                                {salary.accountNumber || "N/A"}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400 block">
                                IFSC Code
                            </label>
                            <div className="font-medium text-gray-900 dark:text-white font-mono">
                                {salary.ifscCode || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                        <Shield className="w-4 h-4 text-gray-400" /> Tax & Identifiers
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400 block">
                                PAN Number
                            </label>
                            <div className="font-medium text-gray-900 dark:text-white font-mono">
                                {salary.panNumber || "N/A"}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400 block">
                                UAN (PF)
                            </label>
                            <div className="font-medium text-gray-900 dark:text-white font-mono">
                                {salary.uanNumber || "N/A"}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-slate-400 block">
                                Tax Regime
                            </label>
                            <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium uppercase mt-1">
                                {salary.taxRegime} Regime
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Salary Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-600" /> Salary Structure
                    </h3>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 uppercase block">Net Monthly Pay</span>
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(salary.netSalary)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-slate-700">
                    {/* Earnings */}
                    <div className="p-6">
                        <h4 className="text-sm font-semibold text-green-600 uppercase mb-4">Earnings</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-slate-400">Basic Salary</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.basic)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-slate-400">HRA</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.hra)}</span>
                            </div>
                            {salary.da > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">DA</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.da)}</span>
                                </div>
                            )}
                            {salary.specialAllowance > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Special Allowance</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.specialAllowance)}</span>
                                </div>
                            )}
                            {salary.conveyanceAllowance > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Conveyance</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.conveyanceAllowance)}</span>
                                </div>
                            )}
                            {salary.medicalAllowance > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">Medical</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.medicalAllowance)}</span>
                                </div>
                            )}
                            {salary.otherAllowances?.map((allowance, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">{allowance.name}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(allowance.amount)}</span>
                                </div>
                            ))}

                            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between font-bold">
                                <span className="text-gray-900 dark:text-white">Gross Salary</span>
                                <span className="text-gray-900 dark:text-white">{formatCurrency(salary.grossSalary)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="p-6 bg-red-50/10 dark:bg-red-900/5">
                        <h4 className="text-sm font-semibold text-red-600 uppercase mb-4">Deductions</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-slate-400">Provident Fund (PF)</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.deductions?.pf)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-slate-400">Professional Tax (PT)</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.deductions?.pt)}</span>
                            </div>
                            {salary.deductions?.esi > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">ESI</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.deductions?.esi)}</span>
                                </div>
                            )}
                            {salary.deductions?.tds > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">TDS (Tax)</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(salary.deductions?.tds)}</span>
                                </div>
                            )}
                            {salary.otherDeductions?.map((deduction, idx) => (
                                <div key={idx} className="flex justify-between">
                                    <span className="text-gray-600 dark:text-slate-400">{deduction.name}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(deduction.amount)}</span>
                                </div>
                            ))}

                            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-slate-700 flex justify-between font-bold">
                                <span className="text-gray-900 dark:text-white">Total Deductions</span>
                                <span className="text-red-600 dark:text-red-400">-{formatCurrency(salary.totalDeductions)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
