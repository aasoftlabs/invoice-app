"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Pencil } from "lucide-react";
import InvoicePreview from "@/components/InvoicePreview";

export default function InvoiceViewer({ invoice, profile }) {
  const router = useRouter();
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 font-sans print:p-0 print:bg-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full">
        {/* Toolbar (Hidden on Print) */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Link
              href={`/invoices/${invoice._id}/edit`}
              className="flex-1 md:flex-none justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold shadow-lg hover:shadow-blue-500/20 active:scale-95 text-sm md:text-base"
            >
              <Pencil className="w-4 h-4" /> Edit Invoice
            </Link>
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-none justify-center bg-slate-800 dark:bg-slate-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-slate-900 dark:hover:bg-slate-600 transition-all font-bold shadow-lg hover:shadow-slate-500/20 active:scale-95 text-sm md:text-base"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Invoice Paper */}
        <InvoicePreview profile={profile} invoiceData={invoice} />
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          /* Ensure the main container fits A4 mostly */
          .print\\:min-h-\\[297mm\\] {
            min-height: 296mm;
          }
        }
      `}</style>
    </div>
  );
}
