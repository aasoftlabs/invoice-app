"use client";

import { useState, useEffect, useCallback } from "react";
import {
    TrendingUp, TrendingDown, Minus, Loader2,
    ChevronDown, ChevronRight, BarChart3
} from "lucide-react";

const fmt = (n) => `₹ ${Math.abs(n).toLocaleString("en-IN")}`;
const sign = (n) => (n >= 0 ? "+" : "-");

function PnLRow({ label, amount, indent = 0, bold = false, highlight, lines = [] }) {
    const [open, setOpen] = useState(false);
    const hasLines = lines.length > 0;

    return (
        <div>
            <div
                onClick={() => hasLines && setOpen((o) => !o)}
                className={`flex justify-between items-center px-4 py-2.5 transition-colors
                    ${indent === 0 ? "bg-gray-50 dark:bg-slate-800/60" : "bg-white dark:bg-slate-800"}
                    ${hasLines ? "cursor-pointer hover:bg-blue-50/30 dark:hover:bg-slate-700/40" : ""}
                    ${highlight === "green" ? "bg-green-50 dark:bg-green-900/20" : ""}
                    ${highlight === "red" ? "bg-red-50 dark:bg-red-900/20" : ""}
                    ${highlight === "blue" ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                `}
                style={{ paddingLeft: `${16 + indent * 20}px` }}
            >
                <div className="flex items-center gap-1.5">
                    {hasLines ? (
                        open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                        indent > 0 && <span className="w-3.5" />
                    )}
                    <span className={`text-sm ${bold ? "font-bold text-gray-900 dark:text-white" : "text-gray-700 dark:text-slate-300"}`}>
                        {label}
                    </span>
                </div>
                <span className={`text-sm font-mono ${bold ? "font-bold" : "font-medium"}
                    ${highlight === "green" ? "text-green-700 dark:text-green-400" : ""}
                    ${highlight === "red" ? "text-red-700 dark:text-red-400" : ""}
                    ${highlight === "blue" ? "text-blue-700 dark:text-blue-400" : ""}
                    ${!highlight ? "text-gray-800 dark:text-slate-200" : ""}
                `}>
                    {fmt(amount)}
                </span>
            </div>

            {/* Sub-lines (expandable) */}
            {open && lines.map((l, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-1.5 bg-white dark:bg-slate-800 border-l-2 border-blue-100 dark:border-blue-900"
                    style={{ paddingLeft: `${16 + (indent + 1) * 20}px` }}>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{l.label}</span>
                    <span className="text-xs font-mono text-gray-600 dark:text-slate-400">{fmt(l.amount)}</span>
                </div>
            ))}
        </div>
    );
}

function Divider({ label }) {
    return (
        <div className="flex items-center gap-2 px-4 py-1">
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600" />
            {label && <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 whitespace-nowrap">{label}</span>}
            <div className="h-px flex-1 bg-gray-200 dark:bg-slate-600" />
        </div>
    );
}

export default function ProfitLoss() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [year, setYear] = useState(String(currentYear));
    const [month, setMonth] = useState("all");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ year });
            if (month !== "all") params.set("month", month);
            const res = await fetch(`/api/accounts/pnl?${params}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
    const months = [
        { v: "all", l: "Full Year" },
        { v: "1", l: "January" }, { v: "2", l: "February" }, { v: "3", l: "March" },
        { v: "4", l: "April" }, { v: "5", l: "May" }, { v: "6", l: "June" },
        { v: "7", l: "July" }, { v: "8", l: "August" }, { v: "9", l: "September" },
        { v: "10", l: "October" }, { v: "11", l: "November" }, { v: "12", l: "December" },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            {data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Revenue", value: data.revenue.total, color: "blue", icon: TrendingUp },
                        { label: "Gross Profit", value: data.grossProfit, color: data.grossProfit >= 0 ? "green" : "red", icon: BarChart3 },
                        { label: "Operating Income", value: data.operatingIncome, color: data.operatingIncome >= 0 ? "green" : "red", icon: Minus },
                        { label: "Net Income", value: data.netIncome, color: data.netIncome >= 0 ? "green" : "red", icon: data.netIncome >= 0 ? TrendingUp : TrendingDown },
                    ].map(({ label, value, color, icon: Icon }) => {
                        const colors = {
                            blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300",
                            green: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-300",
                            red: "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-300",
                        };
                        return (
                            <div key={label} className={`p-4 rounded-xl border ${colors[color]}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4 opacity-70" />
                                    <span className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</span>
                                </div>
                                <p className="text-xl font-bold">{fmt(value)}</p>
                                {label === "Net Income" && (
                                    <p className="text-xs opacity-70 mt-0.5">{sign(value)} {Math.abs(data.netMarginPct)}% margin</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Statement */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Header with filters */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex flex-wrap gap-3 items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            Profit &amp; Loss Statement
                        </h2>
                        {data && <p className="text-xs text-gray-500 mt-0.5">Period: {data.period}</p>}
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {months.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
                        </select>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {years.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                    </div>
                ) : !data ? (
                    <div className="py-16 text-center text-gray-400">No data available</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                        {/* Revenue */}
                        <PnLRow label="Revenue" amount={data.revenue.total} bold highlight="blue" lines={data.revenue.lines} indent={0} />
                        {data.revenue.lines.map((l) => (
                            <PnLRow key={l.label} label={l.label} amount={l.amount} indent={1} />
                        ))}

                        <Divider />

                        {/* COGS */}
                        {data.cogs.total > 0 && <>
                            <PnLRow label="Cost of Goods Sold (COGS)" amount={data.cogs.total} bold lines={data.cogs.lines} indent={0} />
                            {data.cogs.lines.map((l) => (
                                <PnLRow key={l.label} label={l.label} amount={l.amount} indent={1} />
                            ))}
                            <Divider />
                        </>}

                        {/* Gross Profit */}
                        <PnLRow label={`Gross Profit  (${data.grossMarginPct}% margin)`} amount={data.grossProfit} bold highlight={data.grossProfit >= 0 ? "green" : "red"} />

                        <Divider />

                        {/* Operating Expenses */}
                        {data.operatingExpenses.total > 0 && <>
                            <PnLRow label="Operating Expenses" amount={data.operatingExpenses.total} bold indent={0} />
                            {data.operatingExpenses.lines.map((l) => (
                                <PnLRow key={l.label} label={l.label} amount={l.amount} indent={1} />
                            ))}
                            <Divider />
                        </>}

                        {/* Operating Income */}
                        <PnLRow label="Operating Income" amount={data.operatingIncome} bold highlight={data.operatingIncome >= 0 ? "green" : "red"} />

                        {/* Other Income */}
                        {data.otherIncome.total > 0 && <>
                            <Divider />
                            <PnLRow label="Other Income" amount={data.otherIncome.total} bold indent={0} />
                            {data.otherIncome.lines.map((l) => (
                                <PnLRow key={l.label} label={l.label} amount={l.amount} indent={1} />
                            ))}
                        </>}

                        {/* Tax */}
                        {data.tax.total > 0 && <>
                            <Divider />
                            <PnLRow label="Tax Expense" amount={data.tax.total} bold indent={0} />
                            {data.tax.lines.map((l) => (
                                <PnLRow key={l.label} label={l.label} amount={l.amount} indent={1} />
                            ))}
                        </>}

                        <Divider label="bottom line" />

                        {/* Net Income */}
                        <PnLRow
                            label={`Net Income  (${data.netMarginPct}% margin)`}
                            amount={data.netIncome}
                            bold
                            highlight={data.netIncome >= 0 ? "green" : "red"}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
