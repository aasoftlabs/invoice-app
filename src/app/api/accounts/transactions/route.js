import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Invoice from "@/models/Invoice";
import SalarySlip from "@/models/SalarySlip";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const month = searchParams.get("month");

    const year = searchParams.get("year");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const filterAll = searchParams.get("all") === "true";

    const search = searchParams.get("search");

    let query = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (month && year && month !== "all" && year !== "all") {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year && year !== "all") {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive
      query.$or = [
        { description: searchRegex },
        { category: searchRegex },
        { paymentMode: searchRegex },
      ];
    }

    const queryExec = Transaction.find(query).sort({ date: -1 });

    if (!filterAll) {
      const skip = (page - 1) * limit;
      queryExec.skip(skip).limit(limit);
    }

    const transactions = await queryExec;

    // Calculate totals (aggregating for dashboard logic here or separate endpoint depending on need)
    // For now just return list

    // Calculate totals
    // 1. Global Balance (All time)
    const allTransactions = await Transaction.find({});
    let globalIncome = 0;
    let globalExpense = 0;
    allTransactions.forEach((t) => {
      if (t.type === "Credit") globalIncome += t.amount;
      if (t.type === "Debit") globalExpense += t.amount;
    });
    const globalBalance = globalIncome - globalExpense;

    return NextResponse.json({
      success: true,
      data: transactions,
      meta: {
        globalBalance,
      },
    });
  } catch (error) {
    console.error("Transaction Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      date,
      type,
      category,
      amount,
      description,
      paymentMode,
      reference,
    } = body;

    // 1. Create Transaction
    const transaction = new Transaction({
      date: date || new Date(),
      type,
      category,
      amount: parseFloat(amount),
      description,
      paymentMode,
      reference,
      createdBy: session.user.id,
    });

    await transaction.save();

    // 2. Handle Invoice Integration
    if (reference && reference.type === "Invoice" && reference.id) {
      const invoice = await Invoice.findById(reference.id);
      if (invoice) {
        const newAmountPaid = (invoice.amountPaid || 0) + parseFloat(amount);
        let newStatus = invoice.status;

        // Determine Status
        // Allow a small margin of error for floating point
        if (newAmountPaid >= invoice.totalAmount - 1) {
          newStatus = "Paid";
        } else if (newAmountPaid > 0) {
          newStatus = "Partial";
        }

        // Update Invoice
        invoice.amountPaid = newAmountPaid;
        invoice.status = newStatus;
        invoice.paymentHistory.push({
          amount: parseFloat(amount),
          date: new Date(),
          note: `Payment via Accounts: ${paymentMode}`,
          transactionId: transaction._id,
        });

        await invoice.save();
      }
    } else if (reference && reference.type === "SalarySlip" && reference.id) {
      const slip = await SalarySlip.findById(reference.id);
      if (slip) {
        slip.status = "paid";
        slip.paidOn = date || new Date();
        await slip.save();
      }
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Transaction Create Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const transaction = await Transaction.findById(id);
    if (!transaction)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );

    // Rollback references
    if (transaction.reference?.type === "Invoice" && transaction.reference.id) {
      const invoice = await Invoice.findById(transaction.reference.id);
      if (invoice) {
        // Remove from payment history
        invoice.paymentHistory = invoice.paymentHistory.filter(
          (p) => !p.transactionId.equals(transaction._id),
        );

        // Recalculate amount paid
        invoice.amountPaid = (invoice.amountPaid || 0) - transaction.amount;
        if (invoice.amountPaid < 0) invoice.amountPaid = 0;

        // Reset Status
        if (invoice.amountPaid >= invoice.totalAmount - 1) {
          invoice.status = "Paid";
        } else if (invoice.amountPaid > 0) {
          invoice.status = "Partial";
        } else {
          invoice.status = "Pending";
        }
        await invoice.save();
      }
    } else if (
      transaction.reference?.type === "SalarySlip" &&
      transaction.reference.id
    ) {
      const slip = await SalarySlip.findById(transaction.reference.id);
      if (slip) {
        slip.status = "finalized";
        slip.paidOn = null;
        await slip.save();
      }
    }

    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, date, type, category, amount, description, paymentMode } = body;

    const transaction = await Transaction.findById(id);
    if (!transaction)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );

    const oldAmount = transaction.amount;
    const newAmount = parseFloat(amount);
    const amountDiff = newAmount - oldAmount;

    // Update fields
    transaction.date = date;
    transaction.type = type;
    transaction.category = category;
    transaction.amount = newAmount;
    transaction.description = description;
    transaction.paymentMode = paymentMode;

    await transaction.save();

    // Update references if amount changed or just to sync
    if (transaction.reference?.type === "Invoice" && transaction.reference.id) {
      const invoice = await Invoice.findById(transaction.reference.id);
      if (invoice) {
        // Update specific payment history entry matches transactionId
        const historyIndex = invoice.paymentHistory.findIndex((p) =>
          p.transactionId.equals(transaction._id),
        );
        if (historyIndex > -1) {
          invoice.paymentHistory[historyIndex].amount = newAmount;
          invoice.paymentHistory[historyIndex].date = transaction.date;
          invoice.paymentHistory[historyIndex].note =
            `Payment via Accounts: ${paymentMode}`;
        }

        // Update total only if amount changed
        if (amountDiff !== 0) {
          invoice.amountPaid = (invoice.amountPaid || 0) + amountDiff;
          if (invoice.amountPaid < 0) invoice.amountPaid = 0;

          // Recalculate status
          if (invoice.amountPaid >= invoice.totalAmount - 1) {
            invoice.status = "Paid";
          } else if (invoice.amountPaid > 0) {
            invoice.status = "Partial";
          } else {
            invoice.status = "Pending";
          }
        }

        // Always save to persist history updates
        await invoice.save();
      }
    }
    // Salary Slip amount usually matches net pay and isn't partial, so just ensure status is still paid.
    // If amount changes significantly (user error?), we assume it's still "Paid" if existing.

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 },
    );
  }
}
