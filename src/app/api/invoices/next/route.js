import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { auth } from "@/auth";
import { generateNextInvoiceNumber } from "@/lib/invoiceUtils";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const nextInvoiceNo = await generateNextInvoiceNumber(Invoice);
    const preGeneratedId = new mongoose.Types.ObjectId();

    return NextResponse.json({
      success: true,
      invoiceNo: nextInvoiceNo,
      _id: preGeneratedId,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
