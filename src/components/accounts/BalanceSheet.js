"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Loader2,
    Plus,
    Trash2,
    Building2,
    Wallet,
    CreditCard,
    Briefcase,
    Landmark,
    PiggyBank
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useModal } from "@/contexts/ModalContext";

export default function BalanceSheet() {
    const { addToast } = useToast();
    const { confirm } = useModal();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // New Item State
    const [newItem, setNewItem] = useState({
        name: "",
        category: "Fixed Asset",
        amount: "",
        notes: ""
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/accounts/balance-sheet");
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            } else {
                addToast(json.error || "Failed to load balance sheet", "error");
            }
        } catch (error) {
            console.error(error);
            addToast("Failed to load balance sheet", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.amount) return;

        try {
            const res = await fetch("/api/accounts/balance-sheet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newItem),
            });
            const json = await res.json();

            if (json.success) {
                addToast("Item added successfully", "success");
                setIsAdding(false);
                setNewItem({ name: "", category: "Fixed Asset", amount: "", notes: "" });
                fetchData();
            } else {
                addToast(json.error || "Failed to add item", "error");
            }
        } catch (error) {
            addToast("Failed to add item", "error");
        }
    };

    const handleDelete = async (id, name) => {
        if (
            !(await confirm({
                title: "Delete Item",
                message: `Are you sure you want to delete "${name}"?`,
                variant: "danger",
                confirmText: "Delete",
            }))
        )
            return;

        try {
            const res = await fetch(`/api/accounts/balance-sheet?id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                addToast("Item deleted", "success");
                fetchData();
            } else {
                addToast("Failed to delete item", "error");
            }
        } catch (error) {
            addToast("Failed to delete item", "error");
        }
    };

    const calculateTotal = (items = []) => items.reduce((sum, i) => sum + (i.amount || 0), 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!data) return null;

    const totalCurrentAssets = calculateTotal(data.assets.current);
    const totalFixedAssets = calculateTotal(data.assets.fixed);
    const totalAssets = totalCurrentAssets + totalFixedAssets;

    const totalCurrentLiabilities = calculateTotal(data.liabilities.current);
    const totalLongTermLiabilities = calculateTotal(data.liabilities.longTerm);
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    const totalEquity = calculateTotal(data.equity);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <div className="space-y-8">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 uppercase tracking-wider">Total Assets</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">₹ {totalAssets.toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg text-red-600 dark:text-red-300">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 uppercase tracking-wider">Total Liabilities</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">₹ {totalLiabilities.toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg text-green-600 dark:text-green-300">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 uppercase tracking-wider">Total Equity</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹ {totalEquity.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Main Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Assets Column */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        Assets
                    </h2>

                    {/* Current Assets */}
                    <Section
                        title="Current Assets"
                        items={data.assets.current}
                        total={totalCurrentAssets}
                        icon={<Wallet className="w-4 h-4" />}
                        onDelete={handleDelete}
                    />

                    {/* Fixed Assets */}
                    <Section
                        title="Fixed Assets"
                        items={data.assets.fixed}
                        total={totalFixedAssets}
                        icon={<Landmark className="w-4 h-4" />}
                        onDelete={handleDelete}
                    />

                    <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold text-gray-900 dark:text-white border-t-2 border-gray-200 dark:border-slate-600">
                        <span>Total Assets</span>
                        <span>₹ {totalAssets.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        Liabilities & Equity
                    </h2>

                    {/* Current Liabilities */}
                    <Section
                        title="Current Liabilities"
                        items={data.liabilities.current}
                        total={totalCurrentLiabilities}
                        icon={<CreditCard className="w-4 h-4" />}
                        onDelete={handleDelete}
                    />

                    {/* Long Term Liabilities */}
                    <Section
                        title="Long-term Liabilities"
                        items={data.liabilities.longTerm}
                        total={totalLongTermLiabilities}
                        icon={<Briefcase className="w-4 h-4" />}
                        onDelete={handleDelete}
                    />

                    {/* Equity */}
                    <Section
                        title="Equity"
                        items={data.equity}
                        total={totalEquity}
                        icon={<PiggyBank className="w-4 h-4" />}
                        onDelete={handleDelete}
                    />

                    <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-slate-700 rounded-xl font-bold text-gray-900 dark:text-white border-t-2 border-gray-200 dark:border-slate-600">
                        <span>Total Liabilities & Equity</span>
                        <span>₹ {totalLiabilitiesAndEquity.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>

            {/* Add Item Button */}
            <div className="fixed bottom-8 right-8">
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105"
                >
                    <Plus className={`w-6 h-6 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
                </button>
            </div>

            {/* Add Item Modal/Form (Inline for simplicity) */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Add Balance Sheet Item</h3>
                        </div>
                        <form onSubmit={handleAddItem} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Office Laptop"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={newItem.category}
                                    onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                >
                                    <option value="Fixed Asset">Fixed Asset</option>
                                    <option value="Current Asset">Current Asset</option>
                                    <option value="Long-term Liability">Long-term Liability</option>
                                    <option value="Current Liability">Current Liability</option>
                                    <option value="Equity">Equity</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="0.00"
                                    value={newItem.amount}
                                    onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    rows="2"
                                    value={newItem.notes}
                                    onChange={e => setNewItem({ ...newItem, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, items, total, icon, onDelete }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 dark:text-slate-300 text-sm flex items-center gap-2">
                    {icon} {title}
                </h3>
                <span className="text-sm font-bold text-gray-900 dark:text-white">₹ {total.toLocaleString('en-IN')}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400 italic">No items</div>
                ) : (
                    items.map((item, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                            <div>
                                <div className="font-medium text-gray-800 dark:text-slate-200">{item.name}</div>
                                {!item.isSystem && item.notes && <div className="text-xs text-gray-400 mt-0.5">{item.notes}</div>}
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-gray-700 dark:text-slate-300">₹ {item.amount.toLocaleString('en-IN')}</span>
                                {!item.isSystem && (
                                    <button
                                        type="button"
                                        onClick={() => onDelete(item._id, item.name)}
                                        className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete Item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
