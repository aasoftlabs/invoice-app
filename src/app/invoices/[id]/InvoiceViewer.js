"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import InvoicePreview from "@/components/InvoicePreview";

export default function InvoiceViewer({ invoice, profile }) {
  const router = useRouter();
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full">
        {/* Toolbar (Hidden on Print) */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex gap-3">
            <Link
              href={`/invoices/${invoice._id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" /> Edit Invoice
            </Link>
            <button
              onClick={handlePrint}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Invoice
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
