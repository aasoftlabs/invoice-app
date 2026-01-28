"use server";

import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";

export async function verifyInvoice(id, inputInvoiceNo, inputAmount) {
    try {
        await connectDB();
        const invoice = await Invoice.findById(id).lean();

        if (!invoice) {
            return { success: false, error: "Invoice not found in system." };
        }

        // Normalizing inputs for comparison
        const dbInvoiceNo = invoice.invoiceNo.trim();
        const dbAmount = Number(invoice.totalAmount);

        const usInvoiceNo = inputInvoiceNo.trim();
        const usAmount = Number(inputAmount);

        const isMatch =
            dbInvoiceNo.toLowerCase() === usInvoiceNo.toLowerCase() &&
            Math.abs(dbAmount - usAmount) < 0.1; // Float tolerance

        // Masking Function
        const maskString = (str) => {
            if (!str || str.length <= 2) return str;
            return str.substring(0, 2) + "*".repeat(str.length - 2);
        };

        const clientName = invoice.client.name || invoice.client.company || "Walk-in Customer";

        if (isMatch) {
            return {
                success: true,
                isMatch: true,
                data: {
                    invoiceNo: invoice.invoiceNo,
                    date: invoice.date.toISOString(),
                    amount: invoice.totalAmount,
                    clientName: clientName, // Full Name
                    status: invoice.status,
                    type: invoice.type
                }
            };
        } else {
            return {
                success: true,
                isMatch: false,
                data: null
            };
        }

    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, error: "System error during verification." };
    }
}
