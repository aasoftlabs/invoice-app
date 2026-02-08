"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Plus, FileText, Loader2 } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import InvoiceRow from "@/components/InvoiceRow";
import InvoiceFilters from "@/components/invoices/InvoiceFilters";
import Spotlight from "@/components/ui/Spotlight";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useInvoices } from "@/hooks/useInvoices";
import PermissionGate from "@/components/ui/PermissionGate";

export default function InvoiceDashboard({ initialInvoices }) {
  // State for filters
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: "all",
  });

  const [invoices, setInvoices] = useState(initialInvoices);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initialInvoices ? initialInvoices.length >= 20 : true,
  );

  // Use custom hook for fetching
  const { loading: fetchLoading, fetchInvoices } = useInvoices();
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Track first render to avoid redundant fetch
  const isFirstRender = useRef(true);

  // Load data effect
  useEffect(() => {
    let active = true;

    async function loadData() {
      // Skip the initial fetch if we already have server-side data
      if (isFirstRender.current) {
        isFirstRender.current = false;
        if (initialInvoices) {
          return;
        }
      }

      const isInitial = page === 1;

      // Only set "loading more" for pagination
      if (!isInitial) setLoadingMore(true);

      const result = await fetchInvoices(filters, page, 20);

      if (active && result.success) {
        if (isInitial) {
          // Replace all data on filter change (page 1)
          setInvoices(result.data);
        } else {
          // Append data for infinity scroll
          setInvoices((prev) => [...prev, ...result.data]);
        }
        setHasMore(result.data.length >= 20);
      }
      setLoadingMore(false);
    }

    // Skip the redundant background fetch on mount if initialData matches filters
    // However, to keep it simple and robust, we fetch. The server-side sync in page.js
    // already solved the "January vs February" flicker.
    loadData();

    return () => {
      active = false;
    };
  }, [filters, page, fetchInvoices, setInvoices, setHasMore, setLoadingMore]);

  // Reset page when filters change
  useEffect(() => {
    Promise.resolve().then(() => setPage(1));
  }, [filters, setPage]);

  return (
    <PermissionGate permission="invoices">
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
          <Link href="/invoices/create">
            <Button
              icon={Plus}
              size="lg"
              className="whitespace-nowrap shrink-0"
            >
              Add Invoice
            </Button>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats filteredInvoices={invoices} allInvoices={invoices} />

        {/* Filter Card */}
        <InvoiceFilters filters={filters} setFilters={setFilters} />

        <Card className="overflow-hidden">
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-700">
            {fetchLoading && page === 1 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-gray-500 dark:text-slate-400 animate-pulse">
                    Loading invoices...
                  </p>
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
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
              </div>
            ) : (
              invoices.map((inv, index) => {
                const isLast = invoices.length === index + 1;
                return (
                  <div
                    key={inv._id}
                    ref={isLast ? lastInvoiceElementRef : null}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {inv.invoiceNo}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${inv.status === "Paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : inv.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : inv.status === "Overdue"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-800 dark:text-slate-200">
                          {inv.client?.name ||
                            inv.client?.company ||
                            "Walk-in Customer"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          ₹{inv.totalAmount?.toLocaleString() || "0"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {new Date(inv.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/50">
                      <Link href={`/invoices/${inv._id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-gray-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {fetchLoading && page === 1 ? (
                  // Initial/Filter loading state
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        <p className="text-gray-500 dark:text-slate-400 animate-pulse">
                          Updating records...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  // Empty state
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
                  // Data rows
                  invoices.map((inv, index) => {
                    const isLast = invoices.length === index + 1;
                    return (
                      <InvoiceRow
                        key={inv._id}
                        invoice={inv}
                        scrollRef={isLast ? lastInvoiceElementRef : null}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {loadingMore ? (
            <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading more...
            </div>
          ) : null}

          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-500 dark:text-slate-400 text-center">
            Showing {invoices.length} records{" "}
            {loadingMore || (fetchLoading && page === 1)
              ? "..."
              : hasMore
                ? "(Scroll for more)"
                : "(End of list)"}
          </div>

        </Card>
      </div >
    </PermissionGate >
  );
}
