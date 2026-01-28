export function getFiscalYear(date = new Date()) {
    const month = date.getMonth(); // 0-11
    const year = date.getFullYear();

    let startYear, endYear;

    // Fiscal year starts in April (index 3)
    if (month >= 3) {
        startYear = year;
        endYear = year + 1;
    } else {
        startYear = year - 1;
        endYear = year;
    }

    // Format: "2025-26"
    return `${startYear}-${String(endYear).slice(-2)}`;
}

export async function generateNextInvoiceNumber(InvoiceModel) {
    const fiscalYear = getFiscalYear();
    const prefix = `AASL/${fiscalYear}/`;

    // Find the last invoice created in this fiscal year
    // using regex to match strictly the prefix
    const lastInvoice = await InvoiceModel.findOne({
        invoiceNo: { $regex: new RegExp(`^${prefix}\\d{3}$`) },
    })
        .sort({ invoiceNo: -1 })
        .lean();

    let nextSeq = 1;

    if (lastInvoice) {
        const parts = lastInvoice.invoiceNo.split("/");
        const lastSeq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(lastSeq)) {
            nextSeq = lastSeq + 1;
        }
    }

    // Format: AASL/2025-26/001
    return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}
