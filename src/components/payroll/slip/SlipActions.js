import { ArrowLeft, Printer, Download, CreditCard, Mail } from "lucide-react";

export default function SlipActions({
  onBack,
  onPrint,
  onDownload,
  onPay,
  onSendEmail,
  loading,
  status,
}) {
  return (
    <div
      id="action-buttons"
      className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <div className="flex gap-3">
        {status !== "paid" && onPay && (
          <button
            onClick={onPay}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm font-medium"
          >
            <CreditCard className="w-4 h-4" /> Pay & Record
          </button>
        )}

        <button
          onClick={onSendEmail}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm font-medium disabled:opacity-50"
        >
          <Mail className="w-4 h-4" /> Send Email
        </button>

        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={onDownload}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download PDF
        </button>
      </div>
    </div>
  );
}
