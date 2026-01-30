import { AlertCircle, Trash2, Plus } from "lucide-react";
import SalaryInputField from "./SalaryInputField";

export default function SalaryDeductions({
    salary,
    handleNumberChange,
    handleDynamicChange,
    addDynamicField,
    removeDynamicField,
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Manual Deductions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SalaryInputField
                    label="Loan Deduction"
                    name="loanDeduction"
                    value={salary.loanDeduction}
                    onChange={handleNumberChange}
                />
                <SalaryInputField
                    label="Advance Deduction"
                    name="advanceDeduction"
                    value={salary.advanceDeduction}
                    onChange={handleNumberChange}
                />
            </div>

            {/* Other Deductions */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Deductions
                </label>
                {salary.otherDeductions.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            placeholder="Name"
                            value={item.name}
                            onChange={(e) =>
                                handleDynamicChange(
                                    "otherDeductions",
                                    index,
                                    "name",
                                    e.target.value,
                                )
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount}
                            onChange={(e) =>
                                handleDynamicChange(
                                    "otherDeductions",
                                    index,
                                    "amount",
                                    e.target.value,
                                )
                            }
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => removeDynamicField("otherDeductions", index)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => addDynamicField("otherDeductions")}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2"
                >
                    <Plus className="w-4 h-4" /> Add Deduction
                </button>
            </div>
        </div>
    );
}
