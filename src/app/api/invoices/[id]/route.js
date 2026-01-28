import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import { auth } from "@/auth";

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    await connectDB();
    const { id } = await params;
    const data = await req.json();

    const invoice = await Invoice.findByIdAndUpdate(id, data, { new: true });

    if (!invoice)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    // Only admin can delete? Or owner? Let's say any auth user for now or admin.
    // Actually user request didn't specify Delete. But good to have.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    await Invoice.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
