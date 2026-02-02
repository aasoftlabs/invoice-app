import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";

export default function InvoiceItems() {
  const { register, control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <div className="border-t border-gray-100 dark:border-slate-700 pt-6 mt-6">
      <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
        Billable Items
      </h3>
      {fields.map((item, index) => (
        <div
          key={item.id}
          className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl mb-3 border border-gray-200 dark:border-slate-700 shadow-sm"
        >
          <input
            placeholder="Item Description"
            {...register(`items.${index}.description`)}
            className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 mb-2 shadow-sm transition-all"
          />
          <textarea
            placeholder="Additional Details (Optional)"
            rows={2}
            {...register(`items.${index}.subDescription`)}
            className="w-full p-2 border-b border-gray-200 dark:border-slate-700 focus:border-blue-500 outline-none text-xs text-gray-600 dark:text-slate-400 bg-transparent mb-3 resize-none"
          />
          <div className="flex gap-2">
            <div className="w-1/2">
              <label className="text-[10px] text-gray-500">Rate (₹)</label>
              <input
                type="number"
                {...register(`items.${index}.rate`)}
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-1/4">
              <label className="text-[10px] text-gray-500">Qty</label>
              <input
                type="number"
                {...register(`items.${index}.qty`)}
                className="w-full p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="w-1/4 flex items-end justify-end">
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ description: "", rate: 0, qty: 1 })}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-700 text-gray-500 dark:text-slate-400 rounded-xl hover:border-blue-500 dark:hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
      >
        <Plus className="w-5 h-5" /> Add Item
      </button>

      <div className="mt-6 border-t border-gray-100 dark:border-slate-700 pt-6">
        <div className="flex justify-end items-center gap-3">
          <label className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-tight">
            GST Rate (%):
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            {...register("taxRate")}
            className="w-24 p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-right bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold"
          />
        </div>
      </div>
    </div>
  );
}
