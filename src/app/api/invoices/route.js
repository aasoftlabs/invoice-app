import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { auth } from "@/auth";
import { generateNextInvoiceNumber } from "@/lib/invoiceUtils";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Auto-generate if missing
    if (!data.invoiceNo) {
      data.invoiceNo = await generateNextInvoiceNumber(Invoice);
    }

    const newInvoice = await Invoice.create(data);
    return NextResponse.json(
      { success: true, data: newInvoice },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await Invoice.find({}).sort({ date: -1 });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
