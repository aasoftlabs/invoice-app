import { useFormContext } from "react-hook-form";
import { QrCode, PenTool } from "lucide-react";

export default function InvoiceMeta() {
  const { register, watch, setValue } = useFormContext();
  const type = watch("type");
  const showQrCode = watch("showQrCode");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invoice Type Selector */}
        <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between mb-2 shadow-sm">
          <div className="flex items-center gap-2">
            {type === "Digital" ? (
              <QrCode className="w-5 h-5 text-blue-600" />
            ) : (
              <PenTool className="w-5 h-5 text-blue-600" />
            )}
            <div>
              <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                Invoice Type
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">
                {type} Invoice
              </p>
            </div>
          </div>
          <div className="flex bg-white dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600 p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setValue("type", "Standard")}
              className={`px-4 py-1.5 text-xs rounded-md transition-all font-bold ${
                type === "Standard"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => setValue("type", "Digital")}
              className={`px-4 py-1.5 text-xs rounded-md transition-all font-bold ${
                type === "Digital"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
            >
              Digital
            </button>
          </div>
        </div>

        {/* Optional QR Code for Standard */}
        {type === "Standard" && (
          <div className="col-span-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="text-xs font-bold text-gray-600 dark:text-slate-300">
                Show Verification QR
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showQrCode || false}
                {...register("showQrCode")}
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
            Invoice #
          </label>
          <input
            {...register("invoiceNo")}
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
            Date
          </label>
          <input
            type="date"
            {...register("date")}
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
          Due Date
        </label>
        <input
          type="date"
          {...register("dueDate")}
          className="w-full p-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
        />
      </div>
    </div>
  );
}
