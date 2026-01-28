"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { toWords } from "number-to-words";

export default function InvoiceViewer({ invoice, profile }) {
  const handlePrint = () => {
    window.print();
  };

  const amountInWords = (amount) => {
    try {
      return toWords(amount)
        .replace(/,/g, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    } catch (e) {
      return amount;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto print:max-w-none print:mx-0 print:w-full">
        {/* Toolbar (Hidden on Print) */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </Link>
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
        <div
          className="bg-white shadow-lg p-10 print:shadow-none print:p-0"
          style={{ minHeight: "297mm" }}
        >
          {/* Header */}
          <div
            className="border-b-4 pb-6 mb-8 flex justify-between"
            style={{ borderColor: profile?.formatting?.color || "#1d4ed8" }}
          >
            <div className="w-1/2">
              <div className="flex items-center gap-4 mb-2">
                {profile?.logo ? (
                  <img
                    src={profile.logo}
                    className="h-16 w-auto object-contain max-w-[150px]"
                    alt="Logo"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                    Logo
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900 m-0 leading-none">
                    {profile?.name}
                  </h1>
                  {profile?.slogan && (
                    <div className="text-[10px] text-gray-500 uppercase mt-1">
                      {profile.slogan}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-1/2 text-right">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: profile?.formatting?.color || "#1d4ed8" }}
              >
                INVOICE
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <span className="font-bold">Invoice No:</span>{" "}
                  {invoice.invoiceNo}
                </div>
                <div>
                  <span className="font-bold">Date:</span>{" "}
                  {new Date(invoice.date).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-bold">Due Date:</span>{" "}
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex mb-8">
            <div className="w-1/2 pr-4">
              <div
                className="text-xs font-bold uppercase mb-2"
                style={{ color: profile?.formatting?.color || "#1d4ed8" }}
              >
                Bill To (Client):
              </div>
              <div className="text-sm text-gray-800">
                <div className="font-bold">{invoice.client.name}</div>
                <div>{invoice.client.company}</div>
                <div className="whitespace-pre-wrap">
                  {invoice.client.address}
                </div>
                {invoice.client.gst && (
                  <div className="mt-1 text-xs text-gray-500">
                    GSTIN: {invoice.client.gst}
                  </div>
                )}
              </div>
            </div>
            <div className="w-1/2 pl-4 border-l border-gray-100">
              <div
                className="text-xs font-bold uppercase mb-2"
                style={{ color: profile?.formatting?.color || "#1d4ed8" }}
              >
                Bill From:
              </div>
              <div className="text-sm text-gray-800">
                <div className="font-bold">{profile?.name}</div>
                <div className="whitespace-pre-wrap">{profile?.address}</div>
                <div className="mt-2">Phone: {profile?.phone}</div>
                <div>Email: {profile?.email}</div>
                {profile?.gstIn && <div>GSTIN: {profile.gstIn}</div>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr
                className="text-white text-xs"
                style={{
                  backgroundColor: profile?.formatting?.color || "#1d4ed8",
                }}
              >
                <th className="p-2 text-left w-12 border-b-2 border-blue-900">
                  #
                </th>
                <th className="p-2 text-left border-b-2 border-blue-900">
                  Description of Services
                </th>
                <th className="p-2 text-right w-24 border-b-2 border-blue-900">
                  Rate
                </th>
                <th className="p-2 text-center w-12 border-b-2 border-blue-900">
                  Qty
                </th>
                <th className="p-2 text-right w-32 border-b-2 border-blue-900">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i} className="text-sm border-b border-gray-100">
                  <td className="p-3 text-gray-600">{i + 1}</td>
                  <td className="p-3 font-medium text-gray-800">
                    {item.description}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {item.rate.toLocaleString("en-IN")}
                  </td>
                  <td className="p-3 text-center text-gray-600">{item.qty}</td>
                  <td className="p-3 text-right font-bold text-gray-800">
                    {(item.rate * item.qty).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="h-4"></td>
              </tr>

              {/* Totals */}
              <tr>
                <td colSpan={3}></td>
                <td className="p-2 text-right text-xs font-bold text-gray-600">
                  Sub Total
                </td>
                <td className="p-2 text-right text-sm font-bold text-gray-800">
                  {invoice.totalAmount?.toLocaleString("en-IN")}
                </td>
              </tr>
              <tr>
                <td colSpan={3}></td>
                <td className="p-2 text-right text-xs font-bold text-gray-600">
                  GST (0%)
                </td>
                <td className="p-2 text-right text-sm font-bold text-gray-800">
                  -
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={3} className="p-3">
                  <div
                    className="text-[10px] font-bold uppercase"
                    style={{ color: profile?.formatting?.color || "#1d4ed8" }}
                  >
                    Amount in Words:
                  </div>
                  <div className="text-xs italic text-gray-600">
                    {amountInWords(invoice.totalAmount || 0)} Rupees Only
                  </div>
                </td>
                <td
                  className="p-3 text-right text-base font-bold border-t border-blue-200"
                  style={{ color: profile?.formatting?.color || "#1d4ed8" }}
                >
                  TOTAL
                </td>
                <td
                  className="p-3 text-right text-base font-bold border-t border-blue-200"
                  style={{ color: profile?.formatting?.color || "#1d4ed8" }}
                >
                  ₹ {invoice.totalAmount?.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Section */}
          <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
            <div className="w-3/5 text-xs text-gray-500">
              <p className="font-bold text-gray-700">Bank Details:</p>
              <p>Bank: {profile?.bankDetails?.bankName}</p>
              <p>A/C: {profile?.bankDetails?.accountNumber}</p>
              <p>IFSC: {profile?.bankDetails?.ifscCode}</p>
            </div>
            <div className="text-right">
              <div className="h-10"></div>
              <div className="text-[10px] font-bold uppercase border-t border-gray-400 pt-1">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
