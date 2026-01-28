"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function InvoiceRow({ invoice }) {
    const router = useRouter();

    const handleRowClick = () => {
        router.push(`/invoices/${invoice._id}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
        >
            <td className="px-6 py-4 font-medium text-gray-900">
                {invoice.invoiceNo}
            </td>
            <td className="px-6 py-4 text-gray-600 text-sm">
                {new Date(invoice.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                })}
            </td>
            <td className="px-6 py-4 text-gray-800">
                <div className="font-medium text-sm">
                    {invoice.client.name || invoice.client.company || "Walk-in Customer"}
                </div>
                {invoice.client.name && invoice.client.company && (
                    <div className="text-xs text-gray-400">
                        {invoice.client.company}
                    </div>
                )}
            </td>
            <td className="px-6 py-4 text-right font-bold text-gray-800">
                ₹ {invoice.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td className="px-6 py-4">
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                        }`}
                >
                    {invoice.status}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="inline-flex items-center gap-1 text-blue-600 group-hover:text-blue-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="w-3 h-3" />
                </div>
            </td>
        </tr>
    );
}
