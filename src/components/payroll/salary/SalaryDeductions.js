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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
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
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Other Deductions
        </label>
        {salary.otherDeductions.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-2 mb-4 md:mb-2 bg-gray-50/50 dark:bg-slate-700/30 md:bg-transparent p-3 md:p-0 rounded-lg"
          >
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Deduction Name"
                value={item.name}
                onChange={(e) =>
                  handleDynamicChange(
                    "otherDeductions",
                    index,
                    "name",
                    e.target.value,
                  )
                }
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
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
                className="w-24 md:w-32 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-700 placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button
              onClick={() => removeDynamicField("otherDeductions", index)}
              className="w-full md:w-auto flex justify-center items-center text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="md:hidden text-xs font-medium ml-2 uppercase">
                Remove
              </span>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addDynamicField("otherDeductions")}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 mt-2"
        >
          <Plus className="w-4 h-4" /> Add Deduction
        </button>
      </div>
    </div>
  );
}
