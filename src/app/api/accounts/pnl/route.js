import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import { getCategoryById } from "@/lib/accountingCategories";
import { NextResponse } from "next/server";

/**
 * GET /api/accounts/pnl?year=2026&month=2
 * Returns a structured Profit & Loss statement.
 * month is optional (1-12). If omitted, returns full year.
 */
export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const year = parseInt(searchParams.get("year") || new Date().getFullYear());
        const month = searchParams.get("month"); // "1"-"12" or null for full year

        // Build date range in IST
        let startDate, endDate, periodLabel;

        if (month && month !== "all") {
            const m = parseInt(month);
            startDate = new Date(`${year}-${String(m).padStart(2, "0")}-01T00:00:00+05:30`);
            // last day of month
            const lastDay = new Date(year, m, 0).getDate();
            endDate = new Date(`${year}-${String(m).padStart(2, "0")}-${lastDay}T23:59:59+05:30`);
            periodLabel = startDate.toLocaleDateString("en-IN", {
                month: "long", year: "numeric", timeZone: "Asia/Kolkata",
            });
        } else {
            startDate = new Date(`${year}-01-01T00:00:00+05:30`);
            endDate = new Date(`${year}-12-31T23:59:59+05:30`);
            periodLabel = `FY ${year}`;
        }

        const transactions = await Transaction.find({
            date: { $gte: startDate, $lte: endDate },
        });

        // ── Aggregate by P&L group + plLabel ──────────────────────────────────
        const buckets = {};
        // groups in order for display
        const PL_ORDER = ["Revenue", "COGS", "Operating Expense", "Other Income", "Tax"];

        PL_ORDER.forEach((g) => { buckets[g] = {}; });

        transactions.forEach((t) => {
            const cat = getCategoryById(t.accountingCategory);
            if (!cat || !cat.plGroup) return; // BS-only or legacy without category

            const group = cat.plGroup;
            const label = cat.plLabel || cat.label;

            if (!buckets[group]) buckets[group] = {};
            buckets[group][label] = (buckets[group][label] || 0) + t.amount;
        });

        // Handle legacy transactions (no accountingCategory) — count as misc
        transactions.forEach((t) => {
            if (t.accountingCategory) return;
            if (t.type === "Credit") {
                buckets["Revenue"]["Other / Unclassified Income"] =
                    (buckets["Revenue"]["Other / Unclassified Income"] || 0) + t.amount;
            } else {
                buckets["Operating Expense"]["Other / Unclassified Expense"] =
                    (buckets["Operating Expense"]["Other / Unclassified Expense"] || 0) + t.amount;
            }
        });

        // ── Build formatted output ─────────────────────────────────────────────
        const sumBucket = (g) => Object.values(buckets[g] || {}).reduce((a, b) => a + b, 0);

        const toBucketLines = (g) =>
            Object.entries(buckets[g] || {}).map(([label, amount]) => ({ label, amount }));

        const totalRevenue = sumBucket("Revenue");
        const totalCOGS = sumBucket("COGS");
        const grossProfit = totalRevenue - totalCOGS;
        const totalOpEx = sumBucket("Operating Expense");
        const operatingIncome = grossProfit - totalOpEx;
        const totalOtherIncome = sumBucket("Other Income");
        const totalTax = sumBucket("Tax");
        const netIncome = operatingIncome + totalOtherIncome - totalTax;

        const result = {
            period: periodLabel,
            year,
            month: month ? parseInt(month) : null,

            revenue: {
                total: totalRevenue,
                lines: toBucketLines("Revenue"),
            },
            cogs: {
                total: totalCOGS,
                lines: toBucketLines("COGS"),
            },
            grossProfit,
            grossMarginPct: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0",

            operatingExpenses: {
                total: totalOpEx,
                lines: toBucketLines("Operating Expense"),
            },
            operatingIncome,

            otherIncome: {
                total: totalOtherIncome,
                lines: toBucketLines("Other Income"),
            },

            tax: {
                total: totalTax,
                lines: toBucketLines("Tax"),
            },

            netIncome,
            netMarginPct: totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : "0.0",
        };

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error("P&L Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch P&L statement" }, { status: 500 });
    }
}
