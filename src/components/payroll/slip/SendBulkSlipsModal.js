"use client";

import { useState } from "react";
import { X, Mail, Loader2, CheckCircle, Calendar } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";

export default function SendBulkSlipsModal({ isOpen, onClose, onSuccess }) {
  const { alert } = useModal();
  const [loading, setLoading] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    month: currentMonth,
    year: currentYear,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/payroll/email/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        await alert({
          title: "Success",
          message: data.message || "Emails processed successfully",
          variant: "success",
        });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        throw new Error(data.message || "Failed to process emails");
      }
    } catch (error) {
      console.error("Error sending bulk emails:", error);
      await alert({
        title: "Error",
        message: error.message || "Failed to send emails",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Send Bulk Salary Slips
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
            <p className="text-sm font-semibold text-amber-800 mb-2">⚠️ Important Notice</p>
            <p className="text-xs text-amber-700">
              Bulk emails use a simplified PDF format. For the full SlipTemplate format,
              please send emails individually from each slip view or slip card.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
            <p className="text-sm text-blue-800">
              This will send salary slip emails to all employees who have a
              generated slip for the selected month.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Month
              </label>
              <select
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Year
              </label>
              <input
                type="number"
                required
                min="2000"
                max="2100"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                className="w-full p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" /> Send Emails
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
