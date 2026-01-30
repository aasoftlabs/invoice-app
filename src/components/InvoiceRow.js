"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";

export default function InvoiceRow({ invoice }) {
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/invoices/${invoice._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent row click
    if (
      confirm(`Are you sure you want to delete invoice ${invoice.invoiceNo}?`)
    ) {
      try {
        const res = await fetch(`/api/invoices/${invoice._id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          router.refresh();
        } else {
          alert("Failed to delete invoice");
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("An error occurred");
      }
    }
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
          <div className="text-xs text-gray-400">{invoice.client.company}</div>
        )}
      </td>
      <td className="px-6 py-4 text-right font-bold text-gray-800">
        ₹{" "}
        {invoice.totalAmount?.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className="px-6 py-4 text-right text-gray-600 font-medium">
        ₹{" "}
        {(invoice.amountPaid || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
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
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 transition-colors p-1"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm">
            View <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </td>
    </tr>
  );
}
