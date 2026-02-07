"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useInvoices } from "@/hooks/useInvoices";
import { useTransactions } from "@/hooks/useTransactions";

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

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Credit", // Credit or Debit
    category: "Invoice Payment",
    amount: "",
    description: "",
    paymentMode: "Bank Transfer",
    isInvoicePayment: false,
    invoiceId: "",
  });

  // Fetch unpaid invoices
  useEffect(() => {
    async function loadInvoices() {
      if (formData.type === "Credit") {
        setFetchingInvoices(true);
        const data = await fetchUnpaidInvoices();
        setInvoices(data);
        setFetchingInvoices(false);
      }
    }

    if (isOpen) {
      if (editingTransaction) {
        Promise.resolve().then(() => {
          setFormData({
            date: new Date(editingTransaction.date).toISOString().split("T")[0],
            type: editingTransaction.type,
            category: editingTransaction.category,
            amount: editingTransaction.amount,
            description: editingTransaction.description,
            paymentMode: editingTransaction.paymentMode,
            isInvoicePayment: editingTransaction.reference?.type === "Invoice",
            invoiceId: editingTransaction.reference?.id || "",
          });
          if (editingTransaction.type === "Credit") loadInvoices();
        });
      } else {
        Promise.resolve().then(() => {
          setFormData({
            date: new Date().toISOString().split("T")[0],
            type: "Credit",
            category: "Invoice Payment",
            amount: "",
            description: "",
            paymentMode: "Bank Transfer",
            isInvoicePayment: false,
            invoiceId: "",
          });
          loadInvoices();
        });
      }
    }
  }, [isOpen, editingTransaction, fetchUnpaidInvoices, formData.type]);
  // removed formData.type from dep array to avoid loop, same as previous fix

  // Auto-fill amount when invoice is selected
  const handleInvoiceSelect = (invoiceId) => {
    const invoice = invoices.find((inv) => inv._id === invoiceId);
    if (invoice) {
      const pendingAmount = invoice.totalAmount - (invoice.amountPaid || 0);
      setFormData((prev) => ({
        ...prev,
        invoiceId,
        amount: pendingAmount,
        description: `Payment for Invoice #${invoice.invoiceNo} - ${invoice.client.name}`,
      }));
    } else {
      setFormData((prev) => ({ ...prev, invoiceId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date: formData.date,
      type: formData.type,
      category: formData.category,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                type: "Credit",
                category: "Invoice Payment",
                isInvoicePayment: false,
              })
            }
            className={`p-3 rounded-lg border text-center font-semibold transition-all ${
              formData.type === "Credit"
                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 ring-2 ring-green-500 ring-offset-1"
                : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
            }`}
          >
            Credit (Income)
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                type: "Debit",
                category: "Expense",
                isInvoicePayment: false,
              })
            }
            className={`p-3 rounded-lg border text-center font-semibold transition-all ${
              formData.type === "Debit"
                ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 ring-2 ring-red-500 ring-offset-1"
                : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600"
            }`}
          >
            Debit (Expense)
          </button>
        </div>

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
            <option>Cash</option>
            <option>UPI</option>
            <option>Cheque</option>
            <option>Other</option>
          </Select>
        </div>

        {/* Invoice Selection Logic (Only for Credit) */}
        {formData.type === "Credit" && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isInvoicePayment}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isInvoicePayment: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700 dark:text-slate-300 text-sm">
                Link to Invoice (Payment Entry)
              </span>
            </label>

            {formData.isInvoicePayment ? (
              <div className="animate-in fade-in slide-in-from-top-2">
                <Select
                  label="SELECT INVOICE"
                  value={formData.invoiceId}
                  onChange={(e) => handleInvoiceSelect(e.target.value)}
                  className="border-blue-200 dark:border-blue-700 focus:ring-blue-500"
                >
                  <option value="">-- Select Pending Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNo} - {inv.client.name} (Due: ₹
                      {inv.totalAmount - (inv.amountPaid || 0)})
                    </option>
                  ))}
                </Select>
                {fetchingInvoices ? (
                  <p className="text-xs text-blue-600 mt-1">
                    Fetching invoices...
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="CATEGORY"
              list="categories"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="e.g. Salary, Rent"
              className="w-full"
            />
            <datalist id="categories">
              <option value="Invoice Payment" />
              <option value="Salary" />
              <option value="Office Rent" />
              <option value="Utilities" />
              <option value="Travel Expense" />
            </datalist>
          </div>

          <Input
            label="AMOUNT"
            type="number"
            required
            min="0"
            step="any"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            DESCRIPTION / NOTES
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500"
            placeholder="Add details about this transaction..."
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full"
            isLoading={loading}
            icon={CheckCircle}
          >
            Record Transaction
          </Button>
        </div>
      </form>
    </Modal>
  );
}
