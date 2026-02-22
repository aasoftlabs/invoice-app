"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { CheckCircle, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useInvoices } from "@/hooks/useInvoices";
import { useTransactions } from "@/hooks/useTransactions";
import {
  getGroupedCategoriesByType,
  getCategoryById,
} from "@/lib/accountingCategories";

export default function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  editingTransaction,
}) {
  const { alert } = useModal();
  const { fetchUnpaidInvoices } = useInvoices();
  const { saveTransaction, loading } = useTransactions();

  const [invoices, setInvoices] = useState([]);
  const [fetchingInvoices, setFetchingInvoices] = useState(false);

  const defaultFormData = (type = "Credit") => ({
    date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    type,
    accountingCategory: type === "Credit" ? "invoice_payment" : "salary",
    amount: "",
    description: "",
    paymentMode: "Bank Transfer",
    isInvoicePayment: false,
    invoiceId: "",
  });

  const [formData, setFormData] = useState(defaultFormData("Credit"));

  // Derived: current category meta
  const categoryMeta = getCategoryById(formData.accountingCategory);

  // Load unpaid invoices when type is Credit
  const loadInvoices = async () => {
    setFetchingInvoices(true);
    const data = await fetchUnpaidInvoices();
    setInvoices(data);
    setFetchingInvoices(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      Promise.resolve().then(() => {
        setFormData({
          date: new Date(editingTransaction.date).toLocaleDateString("en-CA", {
            timeZone: "Asia/Kolkata",
          }),
          type: editingTransaction.type,
          accountingCategory:
            editingTransaction.accountingCategory ||
            (editingTransaction.type === "Credit"
              ? "invoice_payment"
              : "salary"),
          amount: editingTransaction.amount,
          description: editingTransaction.description || "",
          paymentMode: editingTransaction.paymentMode,
          isInvoicePayment: editingTransaction.reference?.type === "Invoice",
          invoiceId: editingTransaction.reference?.id || "",
        });
        if (editingTransaction.type === "Credit") loadInvoices();
      });
    } else {
      Promise.resolve().then(() => {
        setFormData(defaultFormData("Credit"));
        loadInvoices();
      });
    }
  }, [isOpen, editingTransaction]); // eslint-disable-line react-hooks/exhaustive-deps

  // When type changes, reset accountingCategory to sensible default
  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      accountingCategory: type === "Credit" ? "invoice_payment" : "salary",
      isInvoicePayment: false,
      invoiceId: "",
    }));
    if (type === "Credit") loadInvoices();
  };

  // When accountingCategory changes
  const handleCategoryChange = (id) => {
    const meta = getCategoryById(id);
    const isInvoicePay = id === "invoice_payment";
    setFormData((prev) => ({
      ...prev,
      accountingCategory: id,
      isInvoicePayment: isInvoicePay,
      invoiceId: isInvoicePay ? prev.invoiceId : "",
    }));
    // Auto-set description hint
    if (meta?.description && !formData.description) {
      setFormData((prev) => ({
        ...prev,
        accountingCategory: id,
        isInvoicePayment: isInvoicePay,
        invoiceId: isInvoicePay ? prev.invoiceId : "",
      }));
    }
  };

  // Auto-fill amount from selected invoice
  const handleInvoiceSelect = (invoiceId) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (invoice) {
      const pending = invoice.totalAmount - (invoice.amountPaid || 0);
      setFormData((prev) => ({
        ...prev,
        invoiceId,
        amount: pending,
        description: `Payment for Invoice #${invoice.invoiceNo} - ${invoice.client.name}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, invoiceId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const meta = getCategoryById(formData.accountingCategory);

    const payload = {
      date: formData.date,
      type: formData.type,
      accountingCategory: formData.accountingCategory,
      // Store human-friendly label as the legacy `category` field
      category: meta?.label || formData.accountingCategory,
      amount: formData.amount,
      description: formData.description,
      paymentMode: formData.paymentMode,
      reference: editingTransaction
        ? undefined
        : {
          type:
            formData.isInvoicePayment && formData.type === "Credit"
              ? "Invoice"
              : "None",
          id: formData.invoiceId || null,
        },
    };

    if (editingTransaction) payload._id = editingTransaction._id;

    const result = await saveTransaction(payload, !!editingTransaction);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      await alert({
        title: "Error",
        message: "Error: " + (result.error || "Failed to save"),
        variant: "danger",
      });
    }
  };

  const groupedCategories = getGroupedCategoriesByType(formData.type);

  // P&L / BS impact badge
  const getCategoryBadge = () => {
    if (!categoryMeta) return null;
    if (categoryMeta.plGroup) {
      const colors = {
        Revenue: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
        COGS: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
        "Operating Expense": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
        "Other Income": "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400",
        Tax: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
      };
      return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors[categoryMeta.plGroup] || "bg-gray-100 text-gray-600"}`}>
          P&amp;L → {categoryMeta.plGroup}
        </span>
      );
    }
    if (categoryMeta.bsImpact) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          Balance Sheet Entry
        </span>
      );
    }
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Credit / Debit toggle */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeChange("Credit")}
            className={`p-3 rounded-lg border text-center font-semibold transition-all ${formData.type === "Credit"
                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 ring-2 ring-green-500 ring-offset-1"
                : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
          >
            ↑ Credit (Income)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("Debit")}
            className={`p-3 rounded-lg border text-center font-semibold transition-all ${formData.type === "Debit"
                ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 ring-2 ring-red-500 ring-offset-1"
                : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
              }`}
          >
            ↓ Debit (Expense)
          </button>
        </div>

        {/* Date + Payment Mode */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DATE"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <Select
            label="PAYMENT MODE"
            value={formData.paymentMode}
            onChange={(e) =>
              setFormData({ ...formData, paymentMode: e.target.value })
            }
          >
            <option>Bank Transfer</option>
            <option>UPI</option>
            <option>Cash</option>
            <option>Cheque</option>
            <option>Other</option>
          </Select>
        </div>

        {/* Accounting Category — structured grouped dropdown */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Accounting Category
          </label>
          <select
            required
            value={formData.accountingCategory || ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {Object.entries(groupedCategories).map(([group, cats]) => (
              <optgroup key={group} label={`── ${group} ──`}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Info pill + description */}
          {categoryMeta && (
            <div className="mt-2 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {categoryMeta.description}
                </p>
                <div className="mt-1">{getCategoryBadge()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Invoice Linking — only for Invoice Payment category */}
        {formData.type === "Credit" &&
          formData.accountingCategory === "invoice_payment" && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isInvoicePayment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isInvoicePayment: e.target.checked,
                      invoiceId: "",
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700 dark:text-slate-300 text-sm">
                  Link to a specific Invoice
                </span>
              </label>

              {formData.isInvoicePayment && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <Select
                    label="SELECT INVOICE"
                    value={formData.invoiceId}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                  >
                    <option value="">-- Select Pending Invoice --</option>
                    {invoices.map((inv) => (
                      <option key={inv._id} value={inv._id}>
                        {inv.invoiceNo} — {inv.client.name} (Due: ₹
                        {(inv.totalAmount - (inv.amountPaid || 0)).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </Select>
                  {fetchingInvoices && (
                    <p className="text-xs text-blue-600 mt-1">Fetching invoices…</p>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Amount */}
        <Input
          label="AMOUNT (₹)"
          type="number"
          required
          min="0"
          step="any"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Description / Notes
          </label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Add details about this transaction…"
          />
        </div>

        <div className="pt-1">
          <Button type="submit" className="w-full" isLoading={loading} icon={CheckCircle}>
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
