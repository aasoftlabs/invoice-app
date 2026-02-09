"use client";

import { useState } from "react";
import { verifyInvoice } from "@/app/actions/verifyInvoice";
import { CheckCircle, AlertTriangle, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "@/lib/schemas/verifySchema";

export default function VerificationForm({ invoiceId }) {
    const [step, setStep] = useState("input"); // input | result
    const [serverError, setServerError] = useState("");
    const [result, setResult] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        resolver: zodResolver(verifySchema),
        defaultValues: {
            invoiceNo: "",
            amount: ""
        }
    });

    const onSubmit = async (data) => {
        setServerError("");
        try {
            const response = await verifyInvoice(invoiceId, data.invoiceNo, data.amount);
            if (response.success) {
                setResult(response);
                setStep("result");
            } else {
                setServerError(response.error || "Verification failed");
            }
        } catch (err) {
            setServerError("An unexpected error occurred.");
        }
    };

    const handleRetry = () => {
        setStep("input");
        reset();
        setServerError("");
        setResult(null);
    };

    if (step === "input") {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="text-center mb-6">
                    <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Verify Invoice</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Enter details from the invoice to authenticate.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice Number</label>
                        <input
                            type="text"
                            placeholder="e.g. AASL/2025-26/001"
                            {...register("invoiceNo")}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white placeholder-gray-400 ${errors.invoiceNo ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.invoiceNo ? <p className="text-xs text-red-500 mt-1">{errors.invoiceNo.message}</p> : null}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Total Amount</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 50000.00"
                            {...register("amount")}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white placeholder-gray-400 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.amount ? <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p> : null}
                    </div>

                    {serverError ? <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> {serverError}
                    </div> : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Now"}
                    </button>
                </form>
            </div>
        );
    }

    // Result View
    const { isMatch, data } = result;

    if (!isMatch) {
        return (
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-red-600 p-6 text-center text-white">
                    <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Verification Failed</h1>
                    <p className="text-white/90 text-sm">
                        The details provided do not match our records.
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-red-50 p-4 rounded-lg text-sm text-red-800 border border-red-200">
                        <strong>Security Alert:</strong> We could not verify this invoice.
                        <br /><br />
                        This usually indicates that the <strong>Invoice Number</strong> or <strong>Amount</strong> entered is incorrect, or the document you are holding may have been altered.
                    </div>

                    <button
                        type="button"
                        onClick={handleRetry}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Success View
    return (
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-green-600 p-6 text-center text-white">
                <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold mb-1">Verified Successfully</h1>
                <p className="text-white/90 text-sm">
                    The invoice details match our records.
                </p>
            </div>

            <div className="p-8 space-y-6">
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">Invoice No</p>
                    <p className="text-xl font-bold text-gray-900">{data.invoiceNo}</p>
                </div>

                <div className="border-t border-b border-gray-100 py-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Date</span>
                        <span className="font-medium text-gray-800">
                            {new Date(data.date).toLocaleDateString("en-GB")}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Client</span>
                        <span className="font-medium text-gray-800">
                            {data.clientName}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Recorded Amount</span>
                        <span className="font-bold text-gray-900">
                            ₹ {data.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-400">
                        {data.type === 'Digital'
                            ? "Digitally signed and verified via QR Code."
                            : "This is a Standard Invoice record."}
                    </p>
                </div>
            </div>
        </div>
    );
}
