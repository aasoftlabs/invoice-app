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

export async function GET(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url, "http://localhost");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const fetchAll = searchParams.get("all") === "true";

    // Filters
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let query = {};

    // Apply Filters
    if (status && status !== "all") {
      query.status = status;
    }

    if (year && year !== "all") {
      const y = parseInt(year);
      let startDate, endDate;

      if (month && month !== "all") {
        const m = parseInt(month) - 1; // JS months are 0-indexed
        startDate = new Date(y, m, 1);
        // Start of next month
        endDate = new Date(y, m + 1, 1);
      } else {
        startDate = new Date(y, 0, 1);
        // Start of next year
        endDate = new Date(y + 1, 0, 1);
      }

      // Filter: >= Start AND < End (covers entire period including time)
      query.date = { $gte: startDate, $lt: endDate };
    }

    // Search (Invoice No or Client Name)
    if (search) {
      query.$or = [
        { invoiceNo: { $regex: search, $options: "i" } },
        { "client.name": { $regex: search, $options: "i" } },
        { "client.company": { $regex: search, $options: "i" } },
      ];
    }

    let invoices;

    if (fetchAll) {
      invoices = await Invoice.find(query)
        .select("-items -paymentHistory")
        .sort({ date: -1 });
    } else {
      const skip = (page - 1) * limit;
      invoices = await Invoice.find(query)
        .select("-items -paymentHistory")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
    }
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
