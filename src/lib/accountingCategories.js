/**
 * Accounting Category Definitions
 * Single source of truth for all accounting categories used across the app.
 *
 * Each category maps a transaction to:
 *  - plGroup: where it appears in the P&L statement
 *  - bsImpact: which Balance Sheet line it affects (for asset/equity entries)
 *  - appliesTo: "Credit", "Debit", or "Both"
 */

export const ACCOUNTING_CATEGORIES = [
    // ─── INCOME (Credit only) ───────────────────────────────────────────────────
    {
        id: "invoice_payment",
        label: "Invoice Payment",
        appliesTo: "Credit",
        plGroup: "Revenue",
        plLabel: "Invoice Revenue",
        bsImpact: null, // handled by paymentMode (Cash vs Bank)
        description: "Payment received against a client invoice",
    },
    {
        id: "service_income",
        label: "Service / Consulting Fee",
        appliesTo: "Credit",
        plGroup: "Revenue",
        plLabel: "Service Revenue",
        bsImpact: null,
        description: "Income from services or consulting not linked to an invoice",
    },
    {
        id: "other_income",
        label: "Other Income",
        appliesTo: "Credit",
        plGroup: "Other Income",
        plLabel: "Other Income",
        bsImpact: null,
        description: "Interest, refunds, or miscellaneous income",
    },
    {
        id: "owner_capital",
        label: "Owner's Capital Input",
        appliesTo: "Credit",
        plGroup: null, // Not a P&L item — goes to Balance Sheet equity
        plLabel: null,
        bsImpact: "equity_capital",
        description: "Money invested by the owner into the business",
    },
    {
        id: "loan_received",
        label: "Loan Received",
        appliesTo: "Credit",
        plGroup: null,
        plLabel: null,
        bsImpact: "liability_longterm",
        description: "Business loan received from a bank or lender",
    },

    // ─── COST OF GOODS SOLD / DIRECT COSTS (Debit only) ────────────────────────
    {
        id: "hosting_cloud",
        label: "Hosting / Cloud Services",
        appliesTo: "Debit",
        plGroup: "COGS",
        plLabel: "Hosting & Infrastructure",
        bsImpact: null,
        description: "AWS, GCP, Azure, server hosting costs",
    },
    {
        id: "software_tools",
        label: "Software Tools & SaaS",
        appliesTo: "Debit",
        plGroup: "COGS",
        plLabel: "Software & Tools",
        bsImpact: null,
        description: "Third-party software licenses, SaaS subscriptions used for delivery",
    },
    {
        id: "freelancer_contract",
        label: "Freelancer / Contractor",
        appliesTo: "Debit",
        plGroup: "COGS",
        plLabel: "Contract Labour",
        bsImpact: null,
        description: "Payments to freelancers or sub-contractors for project work",
    },

    // ─── OPERATING EXPENSES (Debit only) ────────────────────────────────────────
    {
        id: "salary",
        label: "Salary / Payroll",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Salaries & Wages",
        bsImpact: null,
        description: "Employee salary disbursements",
    },
    {
        id: "office_rent",
        label: "Office Rent",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Rent",
        bsImpact: null,
        description: "Monthly office or workspace rent",
    },
    {
        id: "utilities",
        label: "Utilities & Internet",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Utilities",
        bsImpact: null,
        description: "Electricity, internet, phone bills",
    },
    {
        id: "travel",
        label: "Travel & Conveyance",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Travel & Conveyance",
        bsImpact: null,
        description: "Business travel, fuel, cab fares",
    },
    {
        id: "marketing",
        label: "Marketing & Advertising",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Sales & Marketing",
        bsImpact: null,
        description: "Advertising, promotions, digital marketing",
    },
    {
        id: "office_supplies",
        label: "Office Supplies & Stationery",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Office Expenses",
        bsImpact: null,
        description: "Stationery, printing, general office consumables",
    },
    {
        id: "professional_fees",
        label: "Professional Fees (CA/Legal)",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Professional Fees",
        bsImpact: null,
        description: "Chartered accountant, legal, or consultant fees",
    },
    {
        id: "misc_expense",
        label: "Miscellaneous Expense",
        appliesTo: "Debit",
        plGroup: "Operating Expense",
        plLabel: "Miscellaneous",
        bsImpact: null,
        description: "Any other operating expense",
    },

    // ─── TAX (Debit only) ───────────────────────────────────────────────────────
    {
        id: "gst_payment",
        label: "GST Payment",
        appliesTo: "Debit",
        plGroup: "Tax",
        plLabel: "GST Paid",
        bsImpact: null,
        description: "GST deposited to government",
    },
    {
        id: "tds_payment",
        label: "TDS / Income Tax",
        appliesTo: "Debit",
        plGroup: "Tax",
        plLabel: "TDS / Income Tax",
        bsImpact: null,
        description: "TDS deducted or advance income tax payment",
    },

    // ─── BALANCE SHEET ONLY — Asset / Liability movements (Debit) ───────────────
    {
        id: "asset_purchase",
        label: "Asset Purchase",
        appliesTo: "Debit",
        plGroup: null, // Not P&L — capitalised
        plLabel: null,
        bsImpact: "fixed_asset",
        description: "Purchase of laptop, equipment, furniture etc.",
    },
    {
        id: "prepaid_expense",
        label: "Prepaid Expense",
        appliesTo: "Debit",
        plGroup: null,
        plLabel: null,
        bsImpact: "current_asset_prepaid",
        description: "Advance rent, insurance, or subscription paid upfront",
    },
    {
        id: "loan_repayment",
        label: "Loan Repayment",
        appliesTo: "Debit",
        plGroup: null,
        plLabel: null,
        bsImpact: "liability_longterm_reduction",
        description: "Repayment of outstanding business loan",
    },
];

/** Get categories filtered by the transaction type */
export function getCategoriesByType(type) {
    return ACCOUNTING_CATEGORIES.filter(
        (c) => c.appliesTo === type || c.appliesTo === "Both"
    );
}

/** Grouped by P&L group for use in <optgroup> selects */
export function getGroupedCategoriesByType(type) {
    const cats = getCategoriesByType(type);
    const groups = {};
    cats.forEach((c) => {
        const groupKey = c.plGroup || "Balance Sheet Entry";
        if (!groups[groupKey]) groups[groupKey] = [];
        groups[groupKey].push(c);
    });
    return groups;
}

/** Find a category by its id */
export function getCategoryById(id) {
    return ACCOUNTING_CATEGORIES.find((c) => c.id === id) || null;
}

/** All valid category IDs — for mongoose enum */
export const CATEGORY_IDS = ACCOUNTING_CATEGORIES.map((c) => c.id);
