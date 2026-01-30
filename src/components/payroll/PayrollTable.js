import { Edit, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PayrollTable({ employees, loading, error }) {
    const router = useRouter();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                    <tr>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">State</th>
                        <th className="px-6 py-3">Gross Salary</th>
                        <th className="px-6 py-3">Deductions</th>
                        <th className="px-6 py-3">Net Salary</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loading ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                Loading employees...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-red-500">
                                Error: {error}
                            </td>
                        </tr>
                    ) : employees.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                No employees found
                            </td>
                        </tr>
                    ) : (
                        employees.map((emp) => (
                            <tr key={emp._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{emp.name}</div>
                                    <div className="text-xs text-gray-500">{emp.email}</div>
                                    {emp.designation && (
                                        <div className="text-xs text-gray-400 italic">
                                            {emp.designation}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-700">
                                        {emp.salary?.state || emp.state || "N/A"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {emp.salary ? (
                                        <span className="text-sm font-semibold text-green-600">
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
                                        <span className="text-sm text-red-600">
                                            {formatCurrency(emp.salary.totalDeductions)}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {emp.salary ? (
                                        <span className="text-sm font-semibold text-blue-600">
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
                                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit salary structure"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                router.push(`/payroll/slips?userId=${emp._id}`)
                                            }
                                            className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
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
        </div>
    );
}
