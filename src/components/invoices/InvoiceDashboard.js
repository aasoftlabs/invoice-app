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
  const [hasMore, setHasMore] = useState(true);

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

  // Load data effect
  useEffect(() => {
    let active = true;

    async function loadData() {
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
            <Button icon={Plus} size="lg">
              Add Invoice
            </Button>
          </Link>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats filteredInvoices={invoices} allInvoices={invoices} />

        {/* Filter Card */}
        <InvoiceFilters filters={filters} setFilters={setFilters} />

        <Card className="overflow-hidden">
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

          {loadingMore && (
            <div className="py-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading more...
            </div>
          )}

          <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-500 dark:text-slate-400 text-center">
            Showing {invoices.length} records{" "}
            {hasMore ? "(Scroll for more)" : "(End of list)"}
          </div>
        </Card>
      </div>
    </PermissionGate>
  );
}
