"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/contexts/ToastContext";
import InvoicePreview from "./InvoicePreview";
import { api } from "@/lib/api";
import { invoiceSchema, defaultInvoiceValues } from "@/lib/schemas/invoiceSchema";

// Sub-components
import InvoiceMeta from "./invoices/form/InvoiceMeta";
import ClientDetails from "./invoices/form/ClientDetails";
import InvoiceItems from "./invoices/form/InvoiceItems";
import InvoiceFooter from "./invoices/form/InvoiceFooter";

export default function InvoiceEditor({ initialData, isEditing = false }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize Form
  const methods = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: defaultInvoiceValues,
  });

  const { reset, handleSubmit, control } = methods;

  // Watch for Preview
  const watchedData = useWatch({ control });

  useEffect(() => {
    // 1. Fetch Profile
    api.setup.getProfile().then((data) => {
      if (data.profile) setProfile(data.profile);
    });

    // 2. Load Data (Edit Mode or New)
    if (isEditing && initialData) {
      reset({
        ...defaultInvoiceValues,
        ...initialData,
        clientName: initialData.client?.name || "",
        clientCompany: initialData.client?.company || "",
        clientAddress: initialData.client?.address || "",
        clientGst: initialData.client?.gst || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : defaultInvoiceValues.date,
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split("T")[0]
          : "",
        items: initialData.items || defaultInvoiceValues.items,
        taxRate: initialData.taxRate || 0,
        type: initialData.type || "Digital",
        showQrCode: initialData.showQrCode || false,
      });
    } else {
      // Fetch Next Invoice Number for new invoices
      api.invoices
        .getNextNumber()
        .then((data) => {
          if (data.success) {
            methods.setValue("invoiceNo", data.invoiceNo);
          }
        })
        .catch(console.error);
    }
  }, [initialData, isEditing, reset, methods]);

  // Submit Handler
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      // Calculate Total (Backend might calculate effectively, but keeping strict parity)
      const subTotal = data.items.reduce(
        (acc, item) => acc + item.rate * item.qty,
        0
      );
      const taxAmount = subTotal * (data.taxRate / 100);
      const totalAmount = subTotal + taxAmount;

      const payload = {
        ...data,
        client: {
          name: data.clientName,
          company: data.clientCompany,
          address: data.clientAddress,
          gst: data.clientGst,
        },
        // Ensure strictly typed
        taxRate: Number(data.taxRate),
        totalAmount,
        dueDate: data.dueDate ? data.dueDate : null,
        status: initialData?.status || "Pending",
      };

      if (isEditing) {
        await api.invoices.update(initialData._id, payload);
      } else {
        await api.invoices.create(payload);
      }

      addToast(
        isEditing
          ? "Invoice Updated Successfully!"
          : "Invoice Saved Successfully!",
        "success"
      );
      router.push(isEditing ? `/invoices/${initialData._id}` : "/");
      router.refresh();
    } catch (error) {
      console.error("Error saving:", error);
      addToast("Failed: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile)
    return (
      <div className="p-10 text-center flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" /> Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      {/* LEFT SIDE: EDITOR */}
      <div className="w-full md:w-1/3 bg-white border-r border-gray-200 print:hidden h-[calc(100vh-4rem)] sticky top-0 flex flex-col">
        <FormProvider {...methods}>
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  {isEditing ? "Edit Invoice" : "New Invoice"}
                </h2>
              </div>
            </div>

            <form id="invoice-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InvoiceMeta />
              <ClientDetails />
              <InvoiceItems />
            </form>
          </div>

          {/* Fixed Footer Actions */}
          <InvoiceFooter isSaving={isSaving} isEditing={isEditing} />
          {/* Note: InvoiceFooter button needs `form="invoice-form"` to trigger submit */}
        </FormProvider>
      </div>

      {/* RIGHT SIDE: PREVIEW */}
      <div className="w-full md:w-2/3 bg-gray-200 p-8 overflow-y-auto flex justify-center print:p-0 print:overflow-visible print:w-full">
        <InvoicePreview
          profile={profile}
          invoiceData={watchedData}
          initialData={initialData}
        />
      </div>
    </div>
  );
}
