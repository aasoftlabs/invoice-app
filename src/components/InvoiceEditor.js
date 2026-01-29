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
      fetch("/api/invoices/next")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInvoiceData((prev) => ({ ...prev, invoiceNo: data.invoiceNo }));
          }
        })
        .catch(console.error);
    }

    // Fetch Company Profile
    fetch("/api/setup")
      .then((res) => res.json())
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



      // ... (inside saveInvoice)
      if (response.ok) {
        addToast(isEditing ? "Invoice Updated Successfully!" : "Invoice Saved Successfully!", "success");
        router.push(isEditing ? `/invoices/${initialData._id}` : "/");
        router.refresh();
      } else {
        const err = await response.json();
        addToast("Failed: " + err.error, "error");
      }
    } catch (error) {
      console.error("Error saving:", error);
      addToast("Failed to save invoice. Please try again.", "error");
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
        <div
          className="bg-white shadow-lg mx-auto print:shadow-none print:w-full print:m-0 flex flex-col"
          style={{
            width: "210mm",
            minHeight: "296mm",
            height: "auto",
            padding: "40px",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            className="border-b-4 pb-6 mb-8 flex justify-between items-end"
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
                  <BrandName
                    name={profile.name}
                    color={profile.formatting?.color}
                  />
                  {profile.slogan && (
                    <div className="text-[8px] text-gray-500 uppercase mt-1">
                      {profile.slogan}
                    </div>
                  )}
                  {profile.tagline && (
                    <div
                      className="text-[10px] uppercase font-bold mt-1"
                      style={{ color: profile.formatting?.color || "#1d4ed8" }}
                    >
                      {profile.tagline}
                    </div>
                  )}

                </div>
              </div>
            </div>
            <div className="w-1/2 flex flex-col items-end text-right">
              <div
                className="text-3xl font-bold mb-2"
                style={{ color: profile.formatting?.color || "#1d4ed8" }}
              >
                INVOICE
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="grid grid-cols-[auto_1fr] gap-x-3 text-right">
                  <span className="font-bold text-right">Invoice No:</span>
                  <span className="text-left">{invoiceData.invoiceNo}</span>

                  <span className="font-bold text-right">Invoice Date:</span>
                  <span className="text-left">
                    {new Date(invoiceData.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>

                  {invoiceData.dueDate && (
                    <>
                      <span className="font-bold text-right">Due Date:</span>
                      <span className="text-left">
                        {new Date(invoiceData.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </>
                  )}
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
                  {invoiceData.clientName || invoiceData.clientCompany || "[Client/Company Name]"}
                </div>
                {invoiceData.clientName && invoiceData.clientCompany && (
                  <div>{invoiceData.clientCompany}</div>
                )}
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
                <div className="font-bold">{profile.billingName || profile.name}</div>
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
                  <td className="py-4 text-gray-800">
                    <div className="font-medium">{item.description}</div>
                    {item.subDescription && (
                      <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">
                        {item.subDescription}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right text-gray-600">
                    {item.rate.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center text-gray-600">{item.qty}</td>
                  <td className="p-3 text-right font-bold text-gray-800">
                    {(item.rate * item.qty).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {calculateSubTotal().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td colSpan={3}></td>
                <td className="p-2 text-right text-xs font-bold text-gray-600">
                  GST ({invoiceData.taxRate}%)
                </td>
                <td className="p-2 text-right text-sm font-bold text-gray-800">
                  {calculateTax().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  ₹ {calculateTotal().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-start">
            <div className="w-3/5">
              <div
                className="text-xs font-bold uppercase mb-2"
                style={{ color: profile.formatting?.color || "#1d4ed8" }}
              >
                BANK DETAILS:
              </div>
              <div className="bg-yellow-50 border border-dashed border-yellow-400 rounded-lg p-4 text-xs print:border-gray-600">
                <div className="grid grid-cols-[80px_1fr] gap-y-1">
                  <span className="font-bold text-gray-700">Bank:</span>
                  <span className="text-gray-800">{profile.bankDetails?.bankName}</span>

                  <span className="font-bold text-gray-700">Account:</span>
                  <span className="text-gray-800">{profile.bankDetails?.accountName}</span>

                  <span className="font-bold text-gray-700">Acc No:</span>
                  <span className="text-gray-800">{profile.bankDetails?.accountNumber}</span>

                  <span className="font-bold text-gray-700">IFSC:</span>
                  <span className="text-gray-800">{profile.bankDetails?.ifscCode}</span>

                  <span className="font-bold text-gray-700">PAN No:</span>
                  <span className="text-gray-800">{profile.pan}</span>
                </div>
              </div>

              {/* Optional QR Code for Standard Invoice */}
              {invoiceData.type === 'Standard' && invoiceData.showQrCode && (
                <div className="mt-4">
                  <QRCodeSVG
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${initialData?._id || 'preview'}`}
                    size={60}
                    level="H"
                  />
                  <div className="text-[9px] text-gray-500 mt-1 max-w-[120px] leading-tight">
                    Scan to verify
                  </div>
                </div>
              )}
            </div>

            <div className="text-right flex flex-col items-end">
              {invoiceData.type === 'Digital' ? (
                <div className="flex flex-col items-end">
                  <div className="mb-2 p-2 bg-white border border-gray-200 rounded-lg">
                    <QRCodeSVG
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${initialData?._id || 'preview'}`}
                      size={80}
                      level="H"
                    />
                  </div>
                  <div className="text-[10px] text-gray-500 max-w-[150px] leading-tight">
                    Digitally Verified. Scan to authenticate.
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold mb-24" style={{ color: profile.formatting?.color || "#1d4ed8", fontFamily: 'Verdana, sans-serif' }}>
                    For {profile.billingName || profile.name}
                  </div>
                  <div className="text-[10px] font-bold uppercase border-t pt-1 min-w-[150px] text-center text-gray-500" style={{ borderColor: profile.formatting?.color || "#1d4ed8" }}>
                    Authorized Signatory
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Page Footer */}
          <div className="mt-auto text-center text-xs text-gray-500 border-t border-gray-100 pt-6">
            <p className="font-semibold text-gray-700 mb-1">Thank you for your business!</p>
            <p className="mb-2">For any enquiries, please email {profile.email}</p>

            {invoiceData.type === 'Digital' && (
              <p className="text-[10px] text-gray-400 italic mt-2">
                This is a computer generated invoice and doesn't need signature.
              </p>
            )}
          </div>

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
        </div >
      </div >
    </div >
  );
}
