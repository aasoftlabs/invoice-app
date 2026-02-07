import { useFormContext } from "react-hook-form";

export default function ClientDetails() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="border-t border-gray-100 dark:border-slate-700 pt-6 mt-6">
      <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
        Client Details
      </h3>

      <input
        placeholder="Client / Contact Name"
        {...register("clientName")}
        className={`w-full mb-3 p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${errors.clientName ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
      />
      {errors.clientName ? <p className="text-xs text-red-500 mb-2">{errors.clientName.message}</p> : null}

      <input
        placeholder="Company Name"
        {...register("clientCompany")}
        className={`w-full mb-3 p-2.5 border rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm ${errors.clientCompany ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
      />
      {errors.clientCompany ? <p className="text-xs text-red-500 mb-2">
          {errors.clientCompany.message}
        </p> : null}

      <textarea
        placeholder="Address"
        {...register("clientAddress")}
        className={`w-full mb-3 p-2.5 border rounded-lg text-sm h-24 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none ${errors.clientAddress ? "border-red-500" : "border-gray-300 dark:border-slate-600"}`}
      />
      {errors.clientAddress ? <p className="text-xs text-red-500 mb-2">
          {errors.clientAddress.message}
        </p> : null}

      <input
        placeholder="Client GSTIN (Optional)"
        {...register("clientGst")}
        className="w-full p-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
      />
    </div>
  );
}
