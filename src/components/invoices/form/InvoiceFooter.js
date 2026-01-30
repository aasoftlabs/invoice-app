import { Save, Loader2 } from "lucide-react";

export default function InvoiceFooter({ isSaving, isEditing }) {
    return (
        <div className="border-t p-6 bg-white shrink-0 z-10 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
                type="submit"
                form="invoice-form"
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        <Save className="w-4 h-4" /> {isEditing ? "Update" : "Save"}
                    </>
                )}
            </button>
        </div>
    );
}
