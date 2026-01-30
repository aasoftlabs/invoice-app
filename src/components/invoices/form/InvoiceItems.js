import { useFieldArray, useFormContext } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";

export default function InvoiceItems() {
    const { register, control, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    return (
        <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Billable Items</h3>
            {fields.map((item, index) => (
                <div
                    key={item.id}
                    className="bg-gray-50 p-3 rounded mb-2 border border-gray-200"
                >
                    <input
                        placeholder="Item Description"
                        {...register(`items.${index}.description`)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white mb-2"
                    />
                    <textarea
                        placeholder="Additional Details (Optional)"
                        rows={2}
                        {...register(`items.${index}.subDescription`)}
                        className="w-full p-2 border-b border-gray-200 focus:border-blue-500 outline-none text-sm text-gray-600 bg-transparent mb-2 resize-none"
                    />
                    <div className="flex gap-2">
                        <div className="w-1/2">
                            <label className="text-[10px] text-gray-500">Rate (₹)</label>
                            <input
                                type="number"
                                {...register(`items.${index}.rate`)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
                            />
                        </div>
                        <div className="w-1/4">
                            <label className="text-[10px] text-gray-500">Qty</label>
                            <input
                                type="number"
                                {...register(`items.${index}.qty`)}
                                className="w-full p-2 border border-gray-300 rounded text-sm"
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
                className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-500 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
                <Plus className="w-4 h-4" /> Add Item
            </button>

            <div className="mt-4 border-t pt-4">
                <div className="flex justify-end items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">
                        GST Rate (%):
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        {...register("taxRate")}
                        className="w-24 p-2 border border-gray-300 rounded text-sm text-right"
                    />
                </div>
            </div>
        </div>
    );
}
