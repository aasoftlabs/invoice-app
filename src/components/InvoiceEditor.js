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
  QrCode,
  PenTool,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toWords } from "number-to-words";
import Link from "next/link";
import BrandName from "./BrandName";
import { useToast } from "@/contexts/ToastContext";
import InvoicePreview from "./InvoicePreview";
import { api } from "@/lib/api";

export default function InvoiceEditor({ initialData, isEditing = false }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initial State
  const defaultInvoice = {
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",

    clientName: "",
    clientCompany: "",
    clientAddress: "",
    clientGst: "",
    items: [
      { description: "Web Application Development", rate: 40000, qty: 1 },
      { description: "Server Configuration", rate: 5000, qty: 1 },
    ],
    taxRate: 0,
    type: "Digital",
  };

  const [invoiceData, setInvoiceData] = useState(defaultInvoice);

  useEffect(() => {
    // Load initial data if editing
    if (isEditing && initialData) {
      setInvoiceData({
        ...defaultInvoice,
        ...initialData,
        clientName: initialData.client?.name || "",
        clientCompany: initialData.client?.company || "",
        clientAddress: initialData.client?.address || "",
        clientGst: initialData.client?.gst || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : defaultInvoice.date,
        taxRate: initialData.taxRate || 0,
        type: initialData.type || "Digital",
        showQrCode: initialData.showQrCode || false,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      // Fetch Next Invoice Number for new invoices
      api.invoices.getNextNumber()
        .then((data) => {
          if (data.success) {
            setInvoiceData((prev) => ({ ...prev, invoiceNo: data.invoiceNo }));
          }
        })
        .catch(console.error);
    }

    // Fetch Company Profile
    api.setup.getProfile()
      .then((data) => {
        if (data.profile) setProfile(data.profile);
      });
  }, [initialData, isEditing]);

  // Calculations
  const calculateSubTotal = () => {
    return invoiceData.items.reduce(
      (acc, item) => acc + item.rate * item.qty,
      0,
    );
  };

  const calculateTax = () => {
    return calculateSubTotal() * (invoiceData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateTax();
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
    newItems[index][field] =
      field === "description" || field === "subDescription"
        ? value
        : Number(value);
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
        taxRate: Number(invoiceData.taxRate) || 0,
        // Send null if dueDate is empty string to avoid CastError
        dueDate: invoiceData.dueDate ? invoiceData.dueDate : null,
        type: invoiceData.type,
        showQrCode: invoiceData.showQrCode,
        totalAmount: calculatedTotal, // Using the logic from previous steps
        status: initialData?.status || "Pending",
      };

      // Need to recalculate total here or ensure it's up to date. 
      // Editor implementation logic:
      const calculateSubTotal = () => invoiceData.items.reduce((acc, item) => acc + item.rate * item.qty, 0);
      const calculateTax = () => calculateSubTotal() * (invoiceData.taxRate / 100);
      const totalAmount = calculateSubTotal() + calculateTax();
      payload.totalAmount = totalAmount;


      let response;
      if (isEditing) {
        await api.invoices.update(initialData._id, payload);
      } else {
        await api.invoices.create(payload);
      }

      addToast(isEditing ? "Invoice Updated Successfully!" : "Invoice Saved Successfully!", "success");
      router.push(isEditing ? `/invoices/${initialData._id}` : "/");
      router.refresh();

    } catch (error) {
      console.error("Error saving:", error);
      addToast("Failed: " + error.message, "error");
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


            {/* Invoice Type Selector */}
            <div className="col-span-2 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {invoiceData.type === 'Digital' ? <QrCode className="w-5 h-5 text-blue-600" /> : <PenTool className="w-5 h-5 text-blue-600" />}
                <div>
                  <p className="text-sm font-bold text-blue-900">Invoice Type</p>
                  <p className="text-xs text-blue-700">{invoiceData.type} Invoice</p>
                </div>
              </div>
              <div className="flex bg-white rounded-md border border-blue-200 p-1">
                <button
                  onClick={() => setInvoiceData({ ...invoiceData, type: 'Standard' })}
                  className={`px-3 py-1 text-xs rounded transition-all ${invoiceData.type === 'Standard' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setInvoiceData({ ...invoiceData, type: 'Digital' })}
                  className={`px-3 py-1 text-xs rounded transition-all ${invoiceData.type === 'Digital' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Digital
                </button>
              </div>
            </div>

            {/* Optional QR Code for Standard */}
            {invoiceData.type === 'Standard' && (
              <div className="col-span-2 bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-600">Show Verification QR</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={invoiceData.showQrCode || false}
                    onChange={(e) => setInvoiceData({ ...invoiceData, showQrCode: e.target.checked })}
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
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={invoiceData.dueDate}
              onChange={(e) =>
                setInvoiceData({ ...invoiceData, dueDate: e.target.value })
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
                type="text"
                placeholder="Item Description"
                value={item.description}
                onChange={(e) =>
                  handleItemChange(index, "description", e.target.value)
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white mb-2"
              />
              <textarea
                placeholder="Additional Details (Optional)"
                rows={2}
                value={item.subDescription || ""}
                onChange={(e) =>
                  handleItemChange(index, "subDescription", e.target.value)
                }
                className="w-full p-2 border-b border-gray-200 focus:border-blue-500 outline-none text-sm text-gray-600 bg-transparent mb-2 resize-none"
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

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-end items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">
                GST Rate (%):
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={invoiceData.taxRate}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    taxRate: Number(e.target.value),
                  })
                }
                className="w-24 p-2 border border-gray-300 rounded text-sm text-right"
              />
            </div>
          </div>
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


      {/* RIGHT SIDE: PREVIEW */}
      <div className="w-full md:w-2/3 bg-gray-200 p-8 overflow-y-auto flex justify-center print:p-0 print:overflow-visible">
        <InvoicePreview
          profile={profile}
          invoiceData={invoiceData}
          initialData={initialData}
        />

        {/* Print CSS */}
        <style jsx global>{`
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
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
  );
}
