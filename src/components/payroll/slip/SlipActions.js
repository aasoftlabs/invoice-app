import { ArrowLeft, Printer, Download, CreditCard, Mail } from "lucide-react";

export default function SlipActions({
  onBack,
  onPrint,
  onDownload,
  onPay,
  onSendEmail,
  downloadLoading,
  emailLoading,
  status,
}) {
  return (
    <div
      id="action-buttons"
      className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-2 md:px-0"
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 md:gap-2 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />{" "}
        <span className="hidden md:inline">Back</span>
      </button>
      <div className="flex gap-2 md:gap-3">
        {status !== "paid" && onPay ? (
          <button
            type="button"
            onClick={onPay}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm font-medium cursor-pointer active:scale-95"
            title="Pay & Record"
          >
            <CreditCard className="w-4 h-4" />{" "}
            <span className="hidden md:inline">Pay & Record</span>
          </button>
        ) : null}

        {onSendEmail ? (
          <button
            type="button"
            onClick={onSendEmail}
            disabled={emailLoading}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm font-medium disabled:opacity-50 cursor-pointer active:scale-95"
            title="Send Email"
          >
            {emailLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            <span className="hidden md:inline">Send Email</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 transition-all shadow-sm cursor-pointer active:scale-95"
          title="Print"
        >
          <Printer className="w-4 h-4" />{" "}
          <span className="hidden md:inline">Print</span>
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloadLoading}
          className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
          title="Download PDF"
        >
          {downloadLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden md:inline">Download PDF</span>
        </button>
      </div>
    </div>
  );
}
