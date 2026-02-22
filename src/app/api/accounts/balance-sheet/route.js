import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import Invoice from "@/models/Invoice";
import SalarySlip from "@/models/SalarySlip";
import BalanceSheetItem from "@/models/BalanceSheetItem";
import { getCategoryById } from "@/lib/accountingCategories";
import { NextResponse } from "next/server";

// Helper: get IST date string "YYYY-MM-DD" from a Date
const toISTDateStr = (d) =>
    new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const asOf = searchParams.get("asOf"); // ISO date string, defaults to today

        // ── 1. Fetch all transactions ─────────────────────────────────────────
        const transactions = await Transaction.find({});

        // ── 2. Determine "current year" window in IST ─────────────────────────
        const today = asOf ? new Date(asOf) : new Date();
        const todayIST = toISTDateStr(today);
        const currentYear = parseInt(todayIST.split("-")[0]);

        const currentYearStart = new Date(`${currentYear}-01-01T00:00:00+05:30`);
        const currentYearEnd = new Date(`${currentYear}-12-31T23:59:59+05:30`);

        // ── 3. Aggregate by accountingCategory and paymentMode ─────────────────
        let cashBalance = 0;
        let bankBalance = 0;
        let prepaidBalance = 0;
        let fixedAssets = 0;
        let ownerCapital = 0;
        let loanLiability = 0;

        // P&L buckets (all-time for retained earnings; current-year for net income)
        let totalIncome = 0;
        let totalExpense = 0;   // P&L expense lines
        let currentYearIncome = 0;
        let currentYearExpense = 0;

        transactions.forEach((t) => {
            const cat = getCategoryById(t.accountingCategory);
            const isCredit = t.type === "Credit";
            const isCurrentYear = t.date >= currentYearStart && t.date <= currentYearEnd;

            // ── Cash vs Bank split ───────────────────────────────────────────
            const sign = isCredit ? 1 : -1;

            // Balance-sheet-only categories don't go through cash/bank normally
            const skipCashBank = cat?.bsImpact &&
                !["equity_capital", "liability_longterm"].includes(cat.bsImpact);

            if (!skipCashBank) {
                if (t.paymentMode === "Cash") {
                    cashBalance += sign * t.amount;
                } else {
                    bankBalance += sign * t.amount;
                }
            }

            // ── Balance Sheet specific impacts ───────────────────────────────
            if (cat?.bsImpact) {
                switch (cat.bsImpact) {
                    case "fixed_asset":
                        fixedAssets += t.amount;
                        break;
                    case "current_asset_prepaid":
                        prepaidBalance += t.amount;
                        break;
                    case "equity_capital":
                        ownerCapital += t.amount;
                        // Also add to bank (owner transferred money in)
                        bankBalance += t.amount;
                        break;
                    case "liability_longterm":
                        loanLiability += t.amount;
                        bankBalance += t.amount;
                        break;
                    case "liability_longterm_reduction":
                        loanLiability -= t.amount;
                        break;
                }
            }

            // ── P&L tallies (only transactions with a plGroup) ──────────────
            if (cat?.plGroup) {
                if (isCredit) {
                    totalIncome += t.amount;
                    if (isCurrentYear) currentYearIncome += t.amount;
                } else {
                    totalExpense += t.amount;
                    if (isCurrentYear) currentYearExpense += t.amount;
                }
            } else if (!cat) {
                // Legacy transaction without accountingCategory — treat as before
                if (isCredit) { totalIncome += t.amount; if (isCurrentYear) currentYearIncome += t.amount; }
                else { totalExpense += t.amount; if (isCurrentYear) currentYearExpense += t.amount; }
            }
        });

        const netIncomeCurrentYear = currentYearIncome - currentYearExpense;
        // Retained earnings = all prior years' net (excludes current year net income, shown separately)
        const allTimeNet = totalIncome - totalExpense;
        const retainedEarnings = allTimeNet - netIncomeCurrentYear;

        // ── 4. Fetch Accounts Receivable (unpaid invoices) ────────────────────
        const unpaidInvoices = await Invoice.find({
            status: { $in: ["Pending", "Partial", "Overdue"] },
        });
        let accountsReceivable = 0;
        unpaidInvoices.forEach((inv) => {
            const due = inv.totalAmount - (inv.amountPaid || 0);
            if (due > 0) accountsReceivable += due;
        });

        // ── 5. Fetch Accounts Payable (unpaid salaries) ───────────────────────
        const unpaidSalaries = await SalarySlip.find({ status: "finalized" }).populate("userId");
        let accountsPayable = 0;
        unpaidSalaries.forEach((slip) => {
            if (slip.userId?.enablePayroll) accountsPayable += slip.netPay;
        });

        // ── 6. Manual BalanceSheetItems ───────────────────────────────────────
        const manualItems = await BalanceSheetItem.find({});

        // ── 7. Build response ─────────────────────────────────────────────────
        const balanceSheet = {
            asOf: todayIST,
            assets: {
                current: [
                    { name: "Cash in Hand", amount: Math.max(0, cashBalance), isSystem: true },
                    { name: "Bank Accounts", amount: Math.max(0, bankBalance), isSystem: true },
                    { name: "Accounts Receivable", amount: accountsReceivable, isSystem: true },
                    { name: "Prepaid Expenses", amount: prepaidBalance, isSystem: true },
                    ...manualItems
                        .filter((i) => i.category === "Current Asset")
                        .map((i) => ({ ...i.toObject(), isSystem: false })),
                ],
                fixed: [
                    { name: "Equipment & Assets", amount: fixedAssets, isSystem: true },
                    ...manualItems
                        .filter((i) => i.category === "Fixed Asset")
                        .map((i) => ({ ...i.toObject(), isSystem: false })),
                ],
            },
            liabilities: {
                current: [
                    { name: "Accounts Payable (Salaries)", amount: accountsPayable, isSystem: true },
                    ...manualItems
                        .filter((i) => i.category === "Current Liability")
                        .map((i) => ({ ...i.toObject(), isSystem: false })),
                ],
                longTerm: [
                    { name: "Loans Payable", amount: Math.max(0, loanLiability), isSystem: true },
                    ...manualItems
                        .filter((i) => i.category === "Long-term Liability")
                        .map((i) => ({ ...i.toObject(), isSystem: false })),
                ],
            },
            equity: [
                { name: "Owner's Capital", amount: ownerCapital, isSystem: true },
                { name: "Retained Earnings", amount: retainedEarnings, isSystem: true },
                { name: `Net Income (${currentYear})`, amount: netIncomeCurrentYear, isSystem: true },
                ...manualItems
                    .filter((i) => i.category === "Equity")
                    .map((i) => ({ ...i.toObject(), isSystem: false })),
            ],
        };

        return NextResponse.json({ success: true, data: balanceSheet });

    } catch (error) {
        console.error("Balance Sheet Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch balance sheet" }, { status: 500 });
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
            createdBy: session.user.id,
        });

        await newItem.save();
        return NextResponse.json({ success: true, data: newItem });

    } catch (error) {
        console.error("Balance Sheet Item Create Error:", error);
        return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
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
        return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
    }
}
