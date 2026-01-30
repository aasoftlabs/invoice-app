"use client";

import { useState, useEffect } from "react";
import { Plus, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, FileText, Search, Edit2, Trash2 } from "lucide-react";
import AddTransactionModal from "@/components/accounts/AddTransactionModal";
import AccountFilters from "@/components/accounts/AccountFilters";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            if (session.user.role !== "admin" && !session.user.permissions?.includes("accounts")) {
                router.push("/");
            }
        }
    }, [session]);

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1, // Default current month
        year: new Date().getFullYear(),
        type: "all"
    });

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                month: filters.month,
                year: filters.year,
                type: filters.type
            }).toString();

            const res = await fetch(`/api/accounts/transactions?${query}`);
            const data = await res.json();
            if (data.success) {
                setTransactions(data.data);
                calculateStats(data.data, data.meta?.globalBalance || 0);
            }
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [filters]); // Re-fetch on filter change

    const calculateStats = (data, globalBalance) => {
        let income = 0;
        let expense = 0;

        data.forEach(t => {
            if (t.type === "Credit") income += t.amount;
            if (t.type === "Debit") expense += t.amount;
        });

        setStats({ income, expense, balance: globalBalance });
    };

    const handleSuccess = () => {
        fetchTransactions();
        setEditingTransaction(null);
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure? This will remove the transaction and revert any linked invoice/salary status.")) return;

        try {
            const res = await fetch(`/api/accounts/transactions?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchTransactions();
            } else {
                alert("Failed to delete");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Company Accounts</h1>
                        <p className="text-gray-500 mt-1">Track financial transactions, ledger, and cash flow</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingTransaction(null);
                            setIsModalOpen(true);
                        }}
                        className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" /> Add Transaction
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Balance */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Net Balance</p>
                            <h3 className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                ₹ {stats.balance.toLocaleString("en-IN")}
                            </h3>
                        </div>
                    </div>

                    {/* Income */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Income</p>
                            <h3 className="text-2xl font-bold text-green-600">
                                ₹ {stats.income.toLocaleString("en-IN")}
                            </h3>
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Total Expenses</p>
                            <h3 className="text-2xl font-bold text-red-600">
                                ₹ {stats.expense.toLocaleString("en-IN")}
                            </h3>
                        </div>
                    </div>
                </div>
                <AccountFilters filters={filters} setFilters={setFilters} />
                {/* Ledger Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" /> Transaction Ledger
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Details</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Mode</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading ledger...</td></tr>
                                ) : transactions.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-8 text-gray-500">No transactions found.</td></tr>
                                ) : (
                                    transactions.map((t) => (
                                        <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(t.date).toLocaleDateString("en-IN")}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{t.description || "No description"}</div>
                                                {t.reference?.type === "Invoice" && (
                                                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded ml-1">
                                                        Linked to Invoice
                                                    </span>
                                                )}
                                                {t.reference?.type === "SalarySlip" && (
                                                    <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded ml-1">
                                                        Salary Slip
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {t.paymentMode}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold">
                                                <div className={`flex items-center justify-end gap-1 ${t.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'Credit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                                    ₹ {t.amount.toLocaleString("en-IN")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(t)}
                                                        className="text-gray-400 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(t._id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                editingTransaction={editingTransaction}
            />
        </div>
    );
}
