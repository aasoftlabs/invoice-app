import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Auto-generate Invoice No if not provided?
    // User snippet has manual input but "INV-2026-001" as default.
    // Ideally we check uniqueness or auto-increment.
    // For now trust the client or if it fails (unique index), return error.

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
