"use client";

import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { ArrowRight, Trash2 } from "lucide-react";

export default function InvoiceRow({ invoice, scrollRef }) {
  const router = useRouter();
  const { confirm, alert } = useModal();

  const handleRowClick = () => {
    router.push(`/invoices/${invoice._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent row click
    if (
      !(await confirm({
        title: "Delete Invoice",
        message: `Are you sure you want to delete invoice ${invoice.invoiceNo}?`,
        variant: "danger",
        confirmText: "Delete",
      }))
    )
      return;
    {
      try {
        const res = await fetch(`/api/invoices/${invoice._id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          router.refresh();
        } else {
          await alert({
            title: "Error",
            message: "Failed to delete invoice",
            variant: "danger",
          });
        }
      } catch (error) {
        console.error("Error deleting invoice:", error);
        await alert({
          title: "Error",
          message: "An error occurred",
          variant: "danger",
        });
      }
    }
  };

  return (
    <tr
      ref={scrollRef}
      onClick={handleRowClick}
      className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors group cursor-pointer"

    >
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
        {invoice.invoiceNo}
      </td>
      <td className="px-6 py-4 text-gray-600 dark:text-slate-400 text-sm">
        {new Date(invoice.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </td>
      <td className="px-6 py-4 text-gray-800 dark:text-slate-200">
        <div className="font-medium text-sm">
          {invoice.client.name || invoice.client.company || "Walk-in Customer"}
        </div>
        {invoice.client.name && invoice.client.company && (
          <div className="text-xs text-gray-400 dark:text-slate-500">
            {invoice.client.company}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right font-bold text-gray-800 dark:text-white">
        ₹{" "}
        {invoice.totalAmount?.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className="px-6 py-4 text-right text-gray-600 dark:text-slate-400 font-medium">
        ₹{" "}
        {(invoice.amountPaid || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice.status === "Paid"
            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
            : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
            }`}
        >
          {invoice.status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-tight group-hover:translate-x-1 transition-transform">
            View <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </td>
    </tr>
  );
}



