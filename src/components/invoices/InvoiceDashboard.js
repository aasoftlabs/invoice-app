"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import DashboardStats from "@/components/DashboardStats";
import InvoiceRow from "@/components/InvoiceRow";
import InvoiceFilters from "@/components/invoices/InvoiceFilters";

export default function InvoiceDashboard({ initialInvoices }) {
    // State for filters
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: "all"
    });

    // Filter Logic
    const filteredInvoices = useMemo(() => {
        return initialInvoices.filter(invoice => {
            const date = new Date(invoice.date);
            const invoiceMonth = date.getMonth() + 1;
            const invoiceYear = date.getFullYear();

            // Month Filter
            if (filters.month !== "all" && invoiceMonth !== filters.month) return false;

            // Year Filter
            if (filters.year !== "all" && invoiceYear !== filters.year) return false;

            // Status Filter
            if (filters.status !== "all" && invoice.status !== filters.status) return false;

            return true;
        });
    }, [initialInvoices, filters]);

    // Recalculate stats based on filtered invoices? 
    // Usually stats show "Total Revenue" (Global) vs "This Month Revenue".
    // If I pass filteredInvoices to DashboardStats, it will show stats for the filtered period.
    // This is often desired behavior ("What was my revenue in March?").
    // Let's stick to this dynamic behavior.

    return (
        <div className="max-w-6xl mx-auto p-8">
            {/* Page Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Invoice Management
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Create, view, and manage your invoices
                    </p>
                </div>
                <Link
                    href="/invoices/create"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md font-medium"
                >
                    <Plus className="w-4 h-4" /> Invoice
                </Link>
            </div>

            {/* Dashboard Stats (Responsive to filters) */}
            <DashboardStats filteredInvoices={filteredInvoices} allInvoices={initialInvoices} />

            {/* Filter Card */}
            <InvoiceFilters filters={filters} setFilters={setFilters} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
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
                    <tbody className="divide-y divide-gray-100">
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-12 text-center text-gray-500 bg-gray-50/50"
                                >
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FileText className="w-10 h-10 text-gray-300" />
                                        <p>No invoices found matching current filters.</p>
                                        {initialInvoices.length === 0 && (
                                            <Link
                                                href="/invoices/create"
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                Create your first invoice
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map((inv) => (
                                <InvoiceRow key={inv._id} invoice={inv} />
                            ))
                        )}
                    </tbody>
                </table>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
                    Showing {filteredInvoices.length} of {initialInvoices.length} records
                </div>
            </div>
        </div>
    );
}
