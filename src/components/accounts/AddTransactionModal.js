"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, Calendar, FileText, CheckCircle } from "lucide-react";

export default function AddTransactionModal({ isOpen, onClose, onSuccess, editingTransaction }) {
    const [loading, setLoading] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [fetchingInvoices, setFetchingInvoices] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: "Credit", // Credit or Debit
        category: "Invoice Payment",
        amount: "",
        description: "",
        paymentMode: "Bank Transfer",
        isInvoicePayment: true,
        invoiceId: ""
    });

    // Fetch unpaid invoices
    const fetchInvoices = useCallback(async (typeOverride) => {
        const typeToCheck = typeOverride || formData.type;
        if (typeToCheck !== "Credit") return;

        try {
            setFetchingInvoices(true);
            const res = await fetch("/api/invoices/unpaid");
            const data = await res.json();

            let allInvoices = [];
            if (data.success) {
                allInvoices = data.data;
            }

            // If editing and we have a linked invoice, ensure it's in the list
            if (editingTransaction && editingTransaction.reference?.type === "Invoice" && editingTransaction.reference.id) {
                const linkedId = editingTransaction.reference.id;
                const exists = allInvoices.find(inv => inv._id === linkedId);

                if (!exists) {
                    try {
                        const resLinked = await fetch(`/api/invoices/${linkedId}`);
                        const dataLinked = await resLinked.json();
                        if (dataLinked.success) {
                            allInvoices = [dataLinked.data, ...allInvoices];
                        }
                    } catch (err) {
                        console.error("Failed to fetch linked invoice", err);
                    }
                }
            }

            setInvoices(allInvoices);
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setFetchingInvoices(false);
        }
    }, [formData.type, editingTransaction]);

    // Reset or Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (editingTransaction) {
                setFormData({
                    date: new Date(editingTransaction.date).toISOString().split('T')[0],
                    type: editingTransaction.type,
                    category: editingTransaction.category,
                    amount: editingTransaction.amount,
                    description: editingTransaction.description,
                    paymentMode: editingTransaction.paymentMode,
                    isInvoicePayment: editingTransaction.reference?.type === "Invoice",
                    invoiceId: editingTransaction.reference?.id || ""
                });
                // Fetch invoices immediately if it's a credit transaction
                if (editingTransaction.type === "Credit") {
                    fetchInvoices("Credit");
                }
            } else {
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    type: "Credit",
                    category: "Invoice Payment",
                    amount: "",
                    description: "",
                    paymentMode: "Bank Transfer",
                    isInvoicePayment: true,
                    invoiceId: ""
                });
                fetchInvoices();
            }
        }
    }, [isOpen, editingTransaction, fetchInvoices]);

    // Auto-fill amount when invoice is selected
    const handleInvoiceSelect = (invoiceId) => {
        const invoice = invoices.find(inv => inv._id === invoiceId);
        if (invoice) {
            const pendingAmount = invoice.totalAmount - (invoice.amountPaid || 0);
            setFormData(prev => ({
                ...prev,
                invoiceId,
                amount: pendingAmount,
                description: `Payment for Invoice #${invoice.invoiceNo} - ${invoice.client.name}`
            }));
        } else {
            setFormData(prev => ({ ...prev, invoiceId: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare payload
            const payload = {
                date: formData.date,
                type: formData.type,
                category: formData.category,
                amount: formData.amount,
                description: formData.description,
                paymentMode: formData.paymentMode,
                // Only send reference info on creation to avoid complexity in editing references for now
                // Or if editing, preserve reference if not changing logic significantly
                reference: editingTransaction ? undefined : {
                    type: formData.isInvoicePayment && formData.type === "Credit" ? "Invoice" : "None",
                    id: formData.invoiceId || null
                }
            };

            if (editingTransaction) {
                payload.id = editingTransaction._id;
            }

            const method = editingTransaction ? "PUT" : "POST";
            const res = await fetch("/api/accounts/transactions", {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
                onClose();
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {editingTransaction ? "Edit Transaction" : "Add New Transaction"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "Credit", category: "Invoice Payment", isInvoicePayment: true })}
                            className={`p-3 rounded-lg border text-center font-semibold transition-all ${formData.type === "Credit"
                                ? "bg-green-50 border-green-200 text-green-700 ring-2 ring-green-500 ring-offset-1"
                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            Credit (Income)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "Debit", category: "Expense", isInvoicePayment: false })}
                            className={`p-3 rounded-lg border text-center font-semibold transition-all ${formData.type === "Debit"
                                ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500 ring-offset-1"
                                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            Debit (Expense)
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full pl-9 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Payment Mode</label>
                            <select
                                value={formData.paymentMode}
                                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option>Bank Transfer</option>
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Cheque</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Invoice Selection Logic (Only for Credit and New Entry) */}
                    {formData.type === "Credit" && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isInvoicePayment}
                                    onChange={(e) => setFormData({ ...formData, isInvoicePayment: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="font-medium text-gray-700 text-sm">Link to Invoice (Payment Entry)</span>
                            </label>

                            {formData.isInvoicePayment && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Invoice</label>
                                    <select
                                        value={formData.invoiceId}
                                        onChange={(e) => handleInvoiceSelect(e.target.value)}
                                        className="w-full p-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="">-- Select Pending Invoice --</option>
                                        {invoices.map(inv => (
                                            <option key={inv._id} value={inv._id}>
                                                {inv.invoiceNo} - {inv.client.name} (Due: ₹{inv.totalAmount - (inv.amountPaid || 0)})
                                            </option>
                                        ))}
                                    </select>
                                    {fetchingInvoices && <p className="text-xs text-blue-600 mt-1">Fetching invoices...</p>}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Category</label>
                        <input
                            list="categories"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Salary, Rent, Invoice Payment"
                        />
                        <datalist id="categories">
                            <option value="Invoice Payment" />
                            <option value="Salary" />
                            <option value="Office Rent" />
                            <option value="Utilities" />
                            <option value="Travel Expense" />
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-8 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Description / Notes</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Add details about this transaction..."
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Process...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" /> Record Transaction
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
