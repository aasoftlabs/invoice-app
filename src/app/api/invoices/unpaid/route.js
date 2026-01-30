import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch pending, partial, or overdue invoices
        const invoices = await Invoice.find({
            status: { $in: ["Pending", "Partial", "Overdue"] }
        })
            .select("invoiceNo client totalAmount amountPaid date")
            .sort({ date: -1 });

        return NextResponse.json({ success: true, data: invoices });
    } catch (error) {
        console.error("Unpaid Invoices Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
    }
}
