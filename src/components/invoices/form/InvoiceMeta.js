import { useFormContext } from "react-hook-form";
import { QrCode, PenTool } from "lucide-react";

export default function InvoiceMeta() {
    const { register, watch, setValue } = useFormContext();
    const type = watch("type");
    const showQrCode = watch("showQrCode");

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Invoice Type Selector */}
                <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {type === "Digital" ? (
                            <QrCode className="w-5 h-5 text-blue-600" />
                        ) : (
                            <PenTool className="w-5 h-5 text-blue-600" />
                        )}
                        <div>
                            <p className="text-sm font-bold text-blue-900">Invoice Type</p>
                            <p className="text-xs text-blue-700">{type} Invoice</p>
                        </div>
                    </div>
                    <div className="flex bg-white rounded-md border border-blue-200 p-1">
                        <button
                            type="button"
                            onClick={() => setValue("type", "Standard")}
                            className={`px-3 py-1 text-xs rounded transition-all ${type === "Standard"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            Standard
                        </button>
                        <button
                            type="button"
                            onClick={() => setValue("type", "Digital")}
                            className={`px-3 py-1 text-xs rounded transition-all ${type === "Digital"
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            Digital
                        </button>
                    </div>
                </div>

                {/* Optional QR Code for Standard */}
                {type === "Standard" && (
                    <div className="col-span-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600">
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
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Invoice #
                    </label>
                    <input
                        {...register("invoiceNo")}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                        Date
                    </label>
                    <input
                        type="date"
                        {...register("date")}
                        className="w-full p-2 border border-gray-300 rounded text-sm outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Due Date
                </label>
                <input
                    type="date"
                    {...register("dueDate")}
                    className="w-full p-2 border border-gray-300 rounded text-sm outline-none"
                />
            </div>
        </div>
    );
}
