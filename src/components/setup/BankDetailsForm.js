import { useFormContext } from "react-hook-form";

export default function BankDetailsForm() {
  const { register } = useFormContext();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
        Bank Details (For Invoice)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Bank Name
          </label>
          <input
            {...register("bankDetails.bankName")}
            className="w-full p-2 border rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Account Name
          </label>
          <input
            {...register("bankDetails.accountName")}
            className="w-full p-2 border rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Account Number
          </label>
          <input
            {...register("bankDetails.accountNumber")}
            className="w-full p-2 border rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            IFSC Code
          </label>
          <input
            {...register("bankDetails.ifscCode")}
            className="w-full p-2 border rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Branch
          </label>
          <input
            {...register("bankDetails.branch")}
            className="w-full p-2 border rounded-lg text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
