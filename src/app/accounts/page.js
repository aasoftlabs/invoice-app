"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useModal } from "@/contexts/ModalContext";
import { useToast } from "@/contexts/ToastContext";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  FileText,
  Loader2
} from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";
import AddTransactionModal from "@/components/accounts/AddTransactionModal";
import AccountFilters from "@/components/accounts/AccountFilters";
import BalanceSheet from "@/components/accounts/BalanceSheet";
import ProfitLoss from "@/components/accounts/ProfitLoss";
import { useTransactions } from "@/hooks/useTransactions";
import PermissionGate from "@/components/ui/PermissionGate";

export default function AccountsPage() {
  const { data: session } = useSession();
  const { confirm, alert } = useModal();
  const { addToast } = useToast();
  const searchParams = useSearchParams();

  // Tab driven by ?tab= query param (set by navbar dropdown links)
  const activeTab = searchParams.get("tab") || "transactions";

  // Use custom hook
  const {
    loading,
    fetchTransactions,
    deleteTransaction: deleteTransactionAPI,
    saveTransaction,
  } = useTransactions();

  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [stats, setStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    type: "all",
    search: "",
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Observer for infinite scroll
  const observer = useRef();
  const lastTransactionElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore],
  );

  const calculateStats = (data, globalBalance) => {
    let income = 0;
    let expense = 0;

    data.forEach((t) => {
      if (t.type === "Credit") income += t.amount;
      if (t.type === "Debit") expense += t.amount;
    });

    setStats({ income, expense, balance: globalBalance });
  };

  const loadTransactions = useCallback(
    async (isLoadMore = false, currentPage = 1) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        }

        const result = await fetchTransactions(filters, currentPage);

        if (result.success) {
          if (isLoadMore) {
            setTransactions((prev) => [...prev, ...result.data]);
          } else {
            setTransactions(result.data);
            if (result.meta?.globalBalance !== undefined) {
              calculateStats(result.data, result.meta.globalBalance);
            }
          }

          if (result.data.length < 50) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          addToast(result.error || "Failed to load transactions", "error");
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch transactions", error);
        addToast("Failed to load transactions", "error");
        setHasMore(false);
      } finally {
        setLoadingMore(false);
      }
    },
    [filters, fetchTransactions, addToast],
  );

  useEffect(() => {
    setPage(1);
    loadTransactions(false, 1);
  }, [filters, loadTransactions]);

  useEffect(() => {
    if (page > 1) {
      loadTransactions(true, page);
    }
  }, [page, loadTransactions]);

  const handleSuccess = () => {
    setPage(1);
    loadTransactions(false, 1);
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      !(await confirm({
        title: "Delete Transaction",
        message:
          "Are you sure? This will remove the transaction and revert any linked invoice/salary status.",
        variant: "danger",
        confirmText: "Delete",
      }))
    )
      return;

    const success = await deleteTransactionAPI(id);
    if (success) {
      addToast("Transaction deleted successfully", "success");
      setPage(1);
      loadTransactions(false, 1);
    } else {
      await alert({
        title: "Error",
        message: "Failed to delete transaction",
        variant: "danger",
      });
    }
  };

  return (
    <PermissionGate permission="accounts">
      <div className="min-h-screen font-sans text-gray-800 dark:text-slate-200">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Company Accounts
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">
                Track financial transactions, ledger, and cash flow
              </p>
            </div>

            {/* Add Transaction button — always visible */}
            <Spotlight
              className="bg-blue-600 dark:bg-blue-700 rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all font-semibold cursor-pointer"
              spotlightColor="rgba(255, 255, 255, 0.25)"
            >
              <button
                type="button"
                onClick={() => {
                  setEditingTransaction(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 text-white w-full h-full hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors rounded-xl"
              >
                <Plus className="w-5 h-5" />{" "}
                <span className="hidden md:inline">Transaction</span>
              </button>
            </Spotlight>
          </div>

          {activeTab === 'transactions' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Balance */}
                <Spotlight className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                      Net Balance
                    </p>
                    <h3
                      className={`text-2xl font-bold ${stats.balance >= 0 ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-500"}`}
                    >
                      ₹ {stats.balance.toLocaleString("en-IN")}
                    </h3>
                  </div>
                </Spotlight>

                {/* Income */}
                <Spotlight className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                      Total Income
                    </p>
                    <h3 className="text-2xl font-bold text-green-600">
                      ₹ {stats.income.toLocaleString("en-IN")}
                    </h3>
                  </div>
                </Spotlight>

                {/* Expense */}
                <Spotlight className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                      Total Expenses
                    </p>
                    <h3 className="text-2xl font-bold text-red-600">
                      ₹ {stats.expense.toLocaleString("en-IN")}
                    </h3>
                  </div>
                </Spotlight>
              </div>

              <AccountFilters filters={filters} setFilters={setFilters} />

              {/* Ledger Table */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />{" "}
                    Transaction Ledger
                  </h2>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-gray-100 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Details</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Mode</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {loading && transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-8 text-gray-500 dark:text-slate-400"
                          >
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            Loading ledger...
                          </td>
                        </tr>
                      ) : transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="text-center py-8 text-gray-500"
                          >
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t, index) => (
                          <tr
                            key={t._id}
                            className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            ref={
                              index === transactions.length - 1
                                ? lastTransactionElementRef
                                : null
                            }
                          >
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                              {new Date(t.date).toLocaleDateString("en-IN")}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {t.description || "No description"}
                              </div>
                              {t.reference?.type === "Invoice" && (
                                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded ml-1">
                                  Linked to Invoice
                                </span>
                              )}
                              {t.reference?.type === "SalarySlip" && (
                                <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded ml-1">
                                  Salary Slip
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                              {t.paymentMode}
                            </td>
                            <td className="px-6 py-4 text-right font-mono font-bold">
                              <div
                                className={`flex items-center justify-end gap-1 ${t.type === "Credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                              >
                                {t.type === "Credit" ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownLeft className="w-3 h-3" />
                                )}
                                ₹ {t.amount.toLocaleString("en-IN")}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(t)}
                                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(t._id)}
                                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

                {/* Mobile Card View (Compact) */}
                <div className="md:hidden">
                  {loading && transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No transactions found.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {transactions.map((t, index) => (
                        <div
                          key={t._id}
                          ref={
                            index === transactions.length - 1
                              ? lastTransactionElementRef
                              : null
                          }
                          className="p-4 bg-white dark:bg-slate-800"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1 mr-2 flex-1">
                              {t.description || "No description"}
                            </div>
                            <div
                              className={`font-mono font-bold text-sm whitespace-nowrap ${t.type === "Credit" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                            >
                              {t.type === "Credit" ? "+" : "-"} ₹
                              {t.amount.toLocaleString("en-IN")}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                              <span>
                                {new Date(t.date).toLocaleDateString("en-IN")}
                              </span>
                              <span>•</span>
                              <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                {t.category}
                              </span>
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() => handleEdit(t)}
                                className="text-blue-600 dark:text-blue-400"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(t._id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {loadingMore ? (
                <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading more
                  transactions...
                </div>
              ) : null}
            </>
          ) : activeTab === 'balance-sheet' ? (
            <BalanceSheet />
          ) : (
            <ProfitLoss />
          )}

        </div>

        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
          editingTransaction={editingTransaction}
        />
      </div>
    </PermissionGate >
  );
}
