"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Printer,
  Save,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toWords } from "number-to-words";
import Link from "next/link";

export default function InvoiceEditor({ initialData, isEditing = false }) {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initial State
  const defaultInvoice = {
    invoiceNo:
      "INV-" +
      new Date().getFullYear() +
      "-" +
      String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    clientName: "",
    clientCompany: "",
    clientAddress: "",
    clientGst: "",
    items: [
      { description: "Web Application Development", rate: 40000, qty: 1 },
      { description: "Server Configuration", rate: 5000, qty: 1 },
    ],
  };

  const [invoiceData, setInvoiceData] = useState(defaultInvoice);

  useEffect(() => {
    // Load initial data if editing
    if (isEditing && initialData) {
      setInvoiceData({
        ...defaultInvoice,
        ...initialData,
        // Map nested client fields back to flat if needed or keep flat
        // My Invoice Model has nested client object. My Editor uses flat fields for inputs?
        // Let's check original create page. It used flat fields in state `clientName` etc.
        // but saved as nested `client: { name... }`.
        // So if initialData comes from DB, it has nested client.
        clientName: initialData.client?.name || "",
        clientCompany: initialData.client?.company || "",
        clientAddress: initialData.client?.address || "",
        clientGst: initialData.client?.gst || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : defaultInvoice.date,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : defaultInvoice.dueDate,
      });
    }

    // Fetch Company Profile
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      });
  }, [initialData, isEditing]);

  // Calculations
  const calculateTotal = () => {
    return invoiceData.items.reduce(
      (acc, item) => acc + item.rate * item.qty,
      0,
    );
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

  // Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = field === "description" ? value : Number(value);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: "", rate: 0, qty: 1 }],
    });
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const handlePrint = () => {
    window.print();
  };

  // Save to MongoDB
  const saveInvoice = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...invoiceData,
        client: {
          name: invoiceData.clientName,
          company: invoiceData.clientCompany,
          address: invoiceData.clientAddress,
          gst: invoiceData.clientGst,
        },
        totalAmount: calculateTotal(),
        status: initialData?.status || "Pending",
      };

      const url = isEditing
        ? `/api/invoices/${initialData._id}`
        : "/api/invoices";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isEditing ? "Invoice Updated!" : "Invoice Saved!");
        router.push(isEditing ? `/invoices/${initialData._id}` : "/");
        router.refresh();
      } else {
        const err = await response.json();
        alert("Failed: " + err.error);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile)
    return (
      <div className="p-10 text-center flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" /> Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      {/* LEFT SIDE: EDITOR */}
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 p-6 overflow-y-auto print:hidden h-screen sticky top-0 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {isEditing ? "Edit Invoice" : "New Invoice"}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Invoice #
              </label>
              <input
                type="text"
                value={invoiceData.invoiceNo}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, invoiceNo: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={invoiceData.date}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, date: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm outline-none"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Client Details
            </h3>
            <input
              placeholder="Client / Contact Name"
              value={invoiceData.clientName}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, clientName: e.target.value })
              }
              className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
            />
            <input
              placeholder="Company Name"
              value={invoiceData.clientCompany}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  clientCompany: e.target.value,
                })
              }
              className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
            />
            <textarea
              placeholder="Address"
              value={invoiceData.clientAddress}
              onChange={(e) =>
                setInvoiceData({
                  ...invoiceData,
                  clientAddress: e.target.value,
                })
              }
              className="w-full mb-2 p-2 border border-gray-300 rounded text-sm h-20"
            />
            <input
              placeholder="Client GSTIN (Optional)"
              value={invoiceData.clientGst}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, clientGst: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              Billable Items
            </h3>
            {invoiceData.items.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded mb-2 border border-gray-200"
              >
                <input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                  className="w-full mb-2 p-2 border border-gray-300 rounded text-sm"
                />
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <label className="text-[10px] text-gray-500">
                      Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(index, "rate", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="w-1/4">
                    <label className="text-[10px] text-gray-500">Qty</label>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, "qty", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="w-1/4 flex items-end justify-end">
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={addItem}
              className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-500 hover:text-blue-500 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="border-t pt-6 flex gap-3 sticky bottom-0 bg-white pb-4 z-10">
            <button
              onClick={handlePrint}
              className="flex-1 bg-gray-800 text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={saveInvoice}
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
        </div>
      </div>

      {/* RIGHT SIDE: PREVIEW */}
      <div className="w-full md:w-2/3 bg-gray-200 p-8 overflow-y-auto flex justify-center print:p-0 print:overflow-visible">
        <div
          className="bg-white shadow-lg mx-auto print:shadow-none print:w-full print:m-0"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "40px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            className="border-b-4 pb-6 mb-8 flex justify-between"
            style={{ borderColor: profile.formatting?.color || "#1d4ed8" }}
          >
            <div className="w-1/2">
              <div className="flex items-center gap-4 mb-2">
                {profile.logo ? (
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
                    {profile.name}
                  </h1>
                  {profile.slogan && (
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
                style={{ color: profile.formatting?.color || "#1d4ed8" }}
              >
                INVOICE
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <span className="font-bold">Invoice No:</span>{" "}
                  {invoiceData.invoiceNo}
                </div>
                <div>
                  <span className="font-bold">Date:</span> {invoiceData.date}
                </div>
                <div>
                  <span className="font-bold">Due Date:</span>{" "}
                  {invoiceData.dueDate}
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="flex mb-8">
            <div className="w-1/2 pr-4">
              <div
                className="text-xs font-bold uppercase mb-2"
                style={{ color: profile.formatting?.color || "#1d4ed8" }}
              >
                Bill To (Client):
              </div>
              <div className="text-sm text-gray-800">
                <div className="font-bold">
                  {invoiceData.clientName || "[Client Name]"}
                </div>
                <div>{invoiceData.clientCompany || "[Company Name]"}</div>
                <div className="whitespace-pre-wrap">
                  {invoiceData.clientAddress || "[Address]"}
                </div>
                {invoiceData.clientGst && (
                  <div className="mt-1 text-xs text-gray-500">
                    GSTIN: {invoiceData.clientGst}
                  </div>
                )}
              </div>
            </div>
            <div className="w-1/2 pl-4 border-l border-gray-100">
              <div
                className="text-xs font-bold uppercase mb-2"
                style={{ color: profile.formatting?.color || "#1d4ed8" }}
              >
                Bill From:
              </div>
              <div className="text-sm text-gray-800">
                <div className="font-bold">{profile.name}</div>
                <div className="whitespace-pre-wrap">{profile.address}</div>
                <div className="mt-2">Phone: {profile.phone}</div>
                <div>Email: {profile.email}</div>
                {profile.gstIn && <div>GSTIN: {profile.gstIn}</div>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr
                className="text-white text-xs"
                style={{
                  backgroundColor: profile.formatting?.color || "#1d4ed8",
                }}
              >
                <th className="p-2 text-left w-12 border-b-2 border-blue-900">
                  #
                </th>
                <th className="p-2 text-left border-b-2 border-blue-900">
                  Description
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
              {invoiceData.items.map((item, i) => (
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
              <tr>
                <td colSpan={3}></td>
                <td className="p-2 text-right text-xs font-bold text-gray-600">
                  Sub Total
                </td>
                <td className="p-2 text-right text-sm font-bold text-gray-800">
                  {calculateTotal().toLocaleString("en-IN")}
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={3} className="p-3">
                  <div
                    className="text-[10px] font-bold uppercase"
                    style={{ color: profile.formatting?.color || "#1d4ed8" }}
                  >
                    Amount in Words:
                  </div>
                  <div className="text-xs italic text-gray-600">
                    {amountInWords(calculateTotal())} Rupees Only
                  </div>
                </td>
                <td
                  className="p-3 text-right text-base font-bold border-t border-blue-200"
                  style={{ color: profile.formatting?.color || "#1d4ed8" }}
                >
                  TOTAL
                </td>
                <td
                  className="p-3 text-right text-base font-bold border-t border-blue-200"
                  style={{ color: profile.formatting?.color || "#1d4ed8" }}
                >
                  ₹ {calculateTotal().toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-10 pt-10 border-t-2 border-dashed border-gray-100 flex justify-between items-end">
            <div className="w-3/5 text-xs text-gray-500">
              <p className="font-bold text-gray-700">Bank Details:</p>
              <p>Bank: {profile.bankDetails?.bankName}</p>
              <p>A/C: {profile.bankDetails?.accountNumber}</p>
              <p>IFSC: {profile.bankDetails?.ifscCode}</p>
            </div>
            <div className="text-right">
              <div className="h-10"></div>
              <div className="text-[10px] font-bold uppercase border-t border-gray-400 pt-1">
                Authorized Signatory
              </div>
            </div>
          </div>

          {/* Print CSS */}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              .print\\:hidden {
                display: none !important;
              }
              .w-full.md\\:w-2\\/3,
              .w-full.md\\:w-2\\/3 * {
                visibility: visible;
              }
              .w-full.md\\:w-2\\/3 {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                background: white;
              }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
