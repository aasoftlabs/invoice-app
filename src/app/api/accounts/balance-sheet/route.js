import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Invoice from "@/models/Invoice";
import SalarySlip from "@/models/SalarySlip";
import BalanceSheetItem from "@/models/BalanceSheetItem";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch Manual Items
        const manualItems = await BalanceSheetItem.find({});

        // 2. Calculate Cash & Bank from Transactions
        // We'll aggregate based on payment mode or assume "Cash" vs others
        const transactions = await Transaction.find({});

        let cashBalance = 0;
        let bankBalance = 0;

        // Also calculate Retained Earnings (Net Profit)
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            const val = t.type === 'Credit' ? t.amount : -t.amount;

            // Asset Allocation
            if (t.paymentMode === 'Cash') {
                cashBalance += val;
            } else {
                bankBalance += val;
            }

            // Equity Calculation
            if (t.type === 'Credit') totalIncome += t.amount;
            if (t.type === 'Debit') totalExpense += t.amount;
        });

        const retainedEarnings = totalIncome - totalExpense;

        // 3. Calculate Accounts Receivable (Unpaid Invoices)
        // Invoice Status: Pending, Partial, Paid, Overdue
        // Receivable = Total Amount - Amount Paid
        const unpaidInvoices = await Invoice.find({
            status: { $in: ['Pending', 'Partial', 'Overdue'] }
        });

        let accountsReceivable = 0;
        unpaidInvoices.forEach(inv => {
            const due = inv.totalAmount - (inv.amountPaid || 0);
            if (due > 0) accountsReceivable += due;
        });

        // 4. Calculate Accounts Payable (Unpaid Salaries)
        // Salary Slip Status: finalized (approved but not paid), paid
        // We only care about validated liabilities, so "finalized"
        // Also check if user is still enrolled in payroll to avoid old/test data
        const unpaidSalaries = await SalarySlip.find({ status: 'finalized' }).populate('userId');

        let accountsPayable = 0;
        unpaidSalaries.forEach(slip => {
            // Only count liability if the user exists and is enrolled in payroll
            if (slip.userId && slip.userId.enablePayroll) {
                accountsPayable += slip.netPay;
            }
        });

        // 5. Structure the Response
        const balanceSheet = {
            assets: {
                current: [
                    { name: "Cash in Hand", amount: cashBalance, isSystem: true },
                    { name: "Bank Accounts", amount: bankBalance, isSystem: true },
                    { name: "Accounts Receivable", amount: accountsReceivable, isSystem: true },
                    ...manualItems.filter(i => i.category === 'Current Asset').map(i => ({ ...i.toObject(), isSystem: false })),
                ],
                fixed: [
                    ...manualItems.filter(i => i.category === 'Fixed Asset').map(i => ({ ...i.toObject(), isSystem: false })),
                ]
            },
            liabilities: {
                current: [
                    { name: "Accounts Payable (Salaries)", amount: accountsPayable, isSystem: true },
                    ...manualItems.filter(i => i.category === 'Current Liability').map(i => ({ ...i.toObject(), isSystem: false })),
                ],
                longTerm: [
                    ...manualItems.filter(i => i.category === 'Long-term Liability').map(i => ({ ...i.toObject(), isSystem: false })),
                ]
            },
            equity: [
                { name: "Retained Earnings", amount: retainedEarnings, isSystem: true },
                ...manualItems.filter(i => i.category === 'Equity').map(i => ({ ...i.toObject(), isSystem: false })),
            ]
        };

        return NextResponse.json({ success: true, data: balanceSheet });

    } catch (error) {
        console.error("Balance Sheet Fetch Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch balance sheet" },
            { status: 500 }
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
        const { name, category, amount, notes } = body;

        if (!name || !category || amount === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newItem = new BalanceSheetItem({
            name,
            category,
            amount: parseFloat(amount),
            notes,
            createdBy: session.user.id
        });

        await newItem.save();

        return NextResponse.json({ success: true, data: newItem });
    } catch (error) {
        console.error("Balance Sheet Item Create Error:", error);
        return NextResponse.json(
            { error: "Failed to create item" },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID required" }, { status: 400 });
        }

        await BalanceSheetItem.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Balance Sheet Item Delete Error:", error);
        return NextResponse.json(
            { error: "Failed to delete item" },
            { status: 500 }
        );
    }
}
