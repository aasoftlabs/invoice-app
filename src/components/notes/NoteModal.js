"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Lock, Globe, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function NoteModal({ isOpen, onClose, onSuccess, initialData }) {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Helper to get local ISO string for datetime-local input (YYYY-MM-DDTHH:mm)
  const toLocalISOString = (date) => {
    const d = new Date(date);
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in milliseconds
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  // Default end time: +1 hour from start
  const getDefaultEndTime = (startDate) => {
    const end = new Date(startDate);
    end.setHours(end.getHours() + 1);
    return toLocalISOString(end);
  };

  const [formData, setFormData] = useState({
    content: "",
    startDateTime: toLocalISOString(new Date()),
    endDateTime: getDefaultEndTime(new Date()),
    share: "private",
    status: "Pending",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        content: initialData.content || "",
        startDateTime: toLocalISOString(initialData.startDateTime),
        endDateTime: toLocalISOString(initialData.endDateTime),
        share: initialData.share || "private",
        status: initialData.status || "Pending",
      });
    } else if (isOpen) {
      const now = new Date();
      setFormData({
        content: "",
        startDateTime: toLocalISOString(now),
        endDateTime: getDefaultEndTime(now),
        share: "private",
        status: "Pending",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      addToast("End time must be after start time", "error");
      return;
    }

    setIsSaving(true);
    try {
      const url = initialData ? `/api/notes/${initialData._id}` : "/api/notes";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        addToast(initialData ? "Note updated!" : "Note added!", "success");
        onSuccess();
      } else {
        addToast(data.error || "Something went wrong", "error");
      }
    } catch (error) {
      addToast("Network error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-5 flex justify-between items-center border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600/10 dark:bg-amber-500/10 p-2 rounded-xl">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {initialData ? "Update Note" : "New Note / Reminder"}
              </h2>
              <p className="text-gray-500 dark:text-slate-400 text-xs mt-0.5">
                Schedule meetings or take memos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Note Content */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              What&#39;s on your mind?
            </label>
            <textarea
              required
              rows={4}
              placeholder="e.g. Meeting on Payroll project"
              className="w-full p-4 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition text-gray-800 placeholder:text-gray-400 dark:placeholder:text-slate-500 font-medium"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            ></textarea>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                From
              </label>
              <input
                type="datetime-local"
                required
                className="w-full p-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition text-gray-800 font-medium"
                value={formData.startDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, startDateTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                To
              </label>
              <input
                type="datetime-local"
                required
                className="w-full p-3 border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition text-gray-800 font-medium"
                value={formData.endDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, endDateTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* Toggle Share & Status */}
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <div className="flex-1 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Note Visibility
              </label>
              <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-600">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, share: "private" })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                    formData.share === "private"
                      ? "bg-gray-800 text-white shadow-md"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Private
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, share: "public" })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                    formData.share === "public"
                      ? "bg-green-600 text-white shadow-md"
                      : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Public
                </button>
              </div>
            </div>

            <div className="w-full md:w-1/3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex flex-col justify-center">
              <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-widest mb-3 text-center">
                Status
              </label>
              <select
                className="w-full p-2 bg-white dark:bg-slate-700 border border-amber-200 dark:border-slate-600 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 outline-none shadow-sm cursor-pointer"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-2 py-3.5 bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-lg hover:shadow-amber-500/20 disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                </>
              ) : initialData ? (
                "Update Note"
              ) : (
                "Create Note"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
