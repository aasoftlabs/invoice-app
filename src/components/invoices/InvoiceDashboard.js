"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, FileText, Loader2 } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import InvoiceRow from "@/components/InvoiceRow";
import InvoiceFilters from "@/components/invoices/InvoiceFilters";
import Spotlight from "@/components/ui/Spotlight";

export default function InvoiceDashboard({ initialInvoices }) {
  // State for filters
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "all",
  });

  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Observer ref
  const observer = useRef();
  const lastInvoiceElementRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore],
  );

  // Fetch Invoices Function
  const fetchInvoices = useCallback(
    async (isLoadMore = false, currentPage = 1) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const query = new URLSearchParams({
          page: currentPage,
          limit: 20,
          month: filters.month,
          year: filters.year,
          status: filters.status,
        }).toString();

        const res = await fetch(`/api/invoices?${query}`);
        const data = await res.json();

        if (data.success) {
          if (isLoadMore) {
            setInvoices((prev) => [...prev, ...data.data]);
          } else {
            setInvoices(data.data);
          }

          // If we got fewer than limit, we reached the end
          if (data.data.length < 20) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          // API returned success: false
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch invoices", error);
        setHasMore(false); // Stop infinite scroll on error
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  // Initial Fetch & Filter Change
  useEffect(() => {
    // Reset to page 1 and fetch fresh when filters change
    setPage(1);
    fetchInvoices(false, 1);
  }, [filters, fetchInvoices]);

  // Load More (Page Change)
  useEffect(() => {
    if (page > 1) {
      fetchInvoices(true, page);
    }
  }, [page, fetchInvoices]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Invoice Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Create, view, and manage your invoices
          </p>
        </div>
        <Spotlight
          className="bg-blue-600 rounded-xl shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          spotlightColor="rgba(255, 255, 255, 0.25)"
        >
          <Link
            href="/invoices/create"
            className="flex items-center gap-2 px-5 py-2.5 text-white font-bold w-full h-full"
          >
            <Plus className="w-5 h-5" /> Add Invoice
          </Link>
        </Spotlight>
      </div>

      {/* Dashboard Stats (Showing stats for CURRENTLY LOADED/FILTERED view - improved logic would need separate stats API) */}
      <DashboardStats
        filteredInvoices={invoices}
        allInvoices={invoices} // DashboardStats might need refactor for true totals, but keeping safe for now
      />

      {/* Filter Card */}
      <InvoiceFilters filters={filters} setFilters={setFilters} />

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-gray-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">Invoice No</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-right">Payment</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {loading && page === 1 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                  <p className="text-gray-500 mt-2">Loading invoices...</p>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-500 dark:text-slate-400 bg-gray-50/50 dark:bg-slate-900/50"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileText className="w-10 h-10 text-gray-300 dark:text-slate-600" />
                    <p>No invoices found matching current filters.</p>
                    <Link
                      href="/invoices/create"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Create your invoice
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv, index) => {
                if (invoices.length === index + 1) {
                  return (
                    <InvoiceRow
                      scrollRef={lastInvoiceElementRef} // Attach ref to last element
                      key={inv._id}
                      invoice={inv}
                    />
                  );
                } else {
                  return <InvoiceRow key={inv._id} invoice={inv} />;
                }
              })
            )}
          </tbody>
        </table>

        {loadingMore && (
          <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading more...
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-500 dark:text-slate-400 text-center">
          Showing {invoices.length} records{" "}
          {hasMore ? "(Scroll for more)" : "(End of list)"}
        </div>
      </div>
    </div>
  );
}
