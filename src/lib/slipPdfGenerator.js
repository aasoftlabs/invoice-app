import { jsPDF } from 'jspdf';

// Helper function to convert number to words (Indian format)
const toWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return '';

    let str = '';
    str += n[1] != 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + ' Crore ' : '';
    str += n[2] != 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + ' Lakh ' : '';
    str += n[3] != 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + ' Thousand ' : '';
    str += n[4] != 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + ' Hundred ' : '';
    str += n[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';

    return str.trim();
};

export const generateSlipPdf = (slipData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 12;
    const contentWidth = pageWidth - (margin * 2);

    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('en-IN');
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[slipData.month - 1];

    let yPos = 20;

    // ============ HEADER ============
    // Logo area - simple circle for company initial
    pdf.setFillColor(219, 234, 254); // bg-blue-100
    pdf.circle(margin + 8, yPos + 8, 8, 'F');
    pdf.setTextColor(37, 99, 235); // text-blue-600
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('A', margin + 8, yPos + 11, { align: 'center' });

    //Company name next to logo
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('AASoftLabs', margin + 20, yPos + 10);

    // Company Address centered
    yPos += 18;
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128); // text-gray-500
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reg. Office: D-603, Ashiana Apartment, Kantatoli, Ranchi, Jharkhand', pageWidth / 2, yPos, { align: 'center' });

    // Title
    yPos += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 64, 175); // text-blue-800
    pdf.text(`Payslip for ${monthName} ${slipData.year}`.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });

    yPos += 3;
    pdf.setDrawColor(229, 231, 235); // border-gray-200
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 10;

    // ============ EMPLOYEE DETAILS - 2 COLUMNS WITH DASHED BORDERS ============
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    const detailsData = [
        ['Employee Name:', slipData.userId.name, 'Payslip No:',
            slipData.userId.employeeId ? `${slipData.userId.employeeId}-${slipData.month}${slipData.year}` : slipData._id.slice(-6).toUpperCase()],
        ['Employee ID:', slipData.userId.employeeId || slipData._id.slice(-6).toUpperCase(), 'Date of Joining:',
            slipData.userId.joiningDate ? new Date(slipData.userId.joiningDate).toLocaleDateString('en-GB') : '-'],
        ['Designation:', slipData.userId.designation || 'N/A', 'Effective Work Days:', String(slipData.presentDays)],
        ['Department:', 'General', 'Loss of Pay (Days):', String(slipData.lopDays || 0)]
    ];

    const halfWidth = contentWidth / 2;
    const labelWidth = halfWidth * 0.45;

    detailsData.forEach((row, idx) => {
        const rowY = yPos + (idx * 8);

        // Left column
        pdf.setTextColor(107, 114, 128); // text-gray-500
        pdf.text(row[0], margin, rowY);
        pdf.setTextColor(17, 24, 39); // text-gray-900
        pdf.setFont('helvetica', 'bold');
        pdf.text(row[1], margin + labelWidth + 5, rowY, { align: 'right' });

        // Right column
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128);
        pdf.text(row[2], margin + halfWidth + 12, rowY);
        pdf.setTextColor(17, 24, 39);
        pdf.setFont('helvetica', 'bold');
        pdf.text(row[3], pageWidth - margin, rowY, { align: 'right' });

        // Dashed border
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.1);
        pdf.setLineDash([1, 1]);
        pdf.line(margin, rowY + 2, margin + halfWidth, rowY + 2);
        pdf.line(margin + halfWidth + 12, rowY + 2, pageWidth - margin, rowY + 2);
        pdf.setLineDash([]);

        pdf.setFont('helvetica', 'normal');
    });

    yPos += 40;

    // ============ EAR NINGS & DEDUCTIONS TABLE ============
    const tableY = yPos;

    // Outer border
    pdf.setDrawColor(209, 213, 219); // border-gray-300
    pdf.setLineWidth(0.3);
    pdf.rect(margin, tableY, contentWidth, 0.3); // Top border placeholder, will be completed later

    // Main headers
    pdf.setFillColor(249, 250, 251); // bg-gray-50
    pdf.rect(margin, tableY, halfWidth, 8, 'F');
    pdf.rect(margin + halfWidth, tableY, halfWidth, 8, 'F');

    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.3);
    pdf.line(margin, tableY + 8, pageWidth - margin, tableY + 8);
    pdf.line(margin + halfWidth, tableY, margin + halfWidth, tableY + 8);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(55, 65, 81); // text-gray-700
    pdf.text('EARNINGS', margin + halfWidth / 2, tableY + 5.5, { align: 'center' });
    pdf.text('DEDUCTIONS', margin + halfWidth + halfWidth / 2, tableY + 5.5, { align: 'center' });

    // Sub headers
    yPos = tableY + 8;
    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPos, halfWidth, 6, 'F');
    pdf.rect(margin + halfWidth, yPos, halfWidth, 6, 'F');

    pdf.setDrawColor(229, 231, 235); // border-gray-200
    pdf.line(margin, yPos + 6, pageWidth - margin, yPos + 6);
    pdf.line(margin + halfWidth, yPos, margin + halfWidth, yPos + 6);

    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128); // text-gray-500
    pdf.setFont('helvetica', 'normal');
    pdf.text('Component', margin + 4, yPos + 4);
    pdf.text('Amount (₹)', margin + halfWidth - 4, yPos + 4, { align: 'right' });
    pdf.text('Component', margin + halfWidth + 4, yPos + 4);
    pdf.text('Amount (₹)', pageWidth - margin - 4, yPos + 4, { align: 'right' });

    yPos += 6;

    // Collect earnings and deductions
    const earnings = [];
    const deductions = [];

    if (slipData.earnings.basic) earnings.push(['Basic Salary', slipData.earnings.basic]);
    if (slipData.earnings.da) earnings.push(['Dearness Allowance', slipData.earnings.da]);
    if (slipData.earnings.hra) earnings.push(['HRA', slipData.earnings.hra]);
    if (slipData.earnings.conveyanceAllowance) earnings.push(['Conveyance', slipData.earnings.conveyanceAllowance]);
    if (slipData.earnings.specialAllowance) earnings.push(['Special Allowance', slipData.earnings.specialAllowance]);
    if (slipData.earnings.medicalAllowance) earnings.push(['Medical Allowance', slipData.earnings.medicalAllowance]);
    if (slipData.earnings.mobileExpense) earnings.push(['Mobile Expense', slipData.earnings.mobileExpense]);
    if (slipData.earnings.distanceAllowance) earnings.push(['Distance Allowance', slipData.earnings.distanceAllowance]);
    if (slipData.earnings.bonus) earnings.push(['Bonus', slipData.earnings.bonus]);
    if (slipData.earnings.arrears) earnings.push(['Arrears', slipData.earnings.arrears]);
    slipData.earnings.otherAllowances?.forEach(a => earnings.push([a.name, a.amount]));

    if (slipData.deductions.pf) deductions.push(['Provident Fund (PF)', slipData.deductions.pf]);
    if (slipData.deductions.esi) deductions.push(['ESI', slipData.deductions.esi]);
    if (slipData.deductions.pt) deductions.push(['Professional Tax', slipData.deductions.pt]);
    if (slipData.deductions.tds) deductions.push(['TDS', slipData.deductions.tds]);
    if (slipData.deductions.loan) deductions.push(['Loan Repayment', slipData.deductions.loan]);
    if (slipData.deductions.advance) deductions.push(['Advance Adjustment', slipData.deductions.advance]);
    if (slipData.deductions.lop) deductions.push(['Loss of Pay (LOP)', slipData.deductions.lop]);
    slipData.deductions.otherDeductions?.forEach(d => deductions.push([d.name, d.amount]));

    const maxRows = Math.max(earnings.length, deductions.length);

    // Draw data rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(55, 65, 81); // text-gray-700

    for (let i = 0; i < maxRows; i++) {
        const rowY = yPos + (i * 6);

        // Earnings
        if (i < earnings.length) {
            pdf.setTextColor(55, 65, 81);
            pdf.text(earnings[i][0], margin + 4, rowY + 4);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(17, 24, 39); // text-gray-900
            pdf.text(`₹${formatCurrency(earnings[i][1])}`, margin + halfWidth - 4, rowY + 4, { align: 'right' });
            pdf.setFont('helvetica', 'normal');

            // Light gray divider
            pdf.setDrawColor(243, 244, 246); // divide-gray-100
            pdf.setLineWidth(0.1);
            pdf.line(margin, rowY + 6, margin + halfWidth, rowY + 6);
        }

        // Deductions
        if (i < deductions.length) {
            pdf.setTextColor(55, 65, 81);
            pdf.text(deductions[i][0], margin + halfWidth + 4, rowY + 4);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(17, 24, 39);
            pdf.text(`₹${formatCurrency(deductions[i][1])}`, pageWidth - margin - 4, rowY + 4, { align: 'right' });
            pdf.setFont('helvetica', 'normal');

            pdf.setDrawColor(243, 244, 246);
            pdf.line(margin + halfWidth, rowY + 6, pageWidth - margin, rowY + 6);
        }

        // Vertical divider
        pdf.setDrawColor(209, 213, 219);
        pdf.setLineWidth(0.3);
        pdf.line(margin + halfWidth, rowY, margin + halfWidth, rowY + 6);
    }

    yPos += (maxRows * 6);

    // Totals row
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    pdf.setFillColor(249, 250, 251);
    pdf.rect(margin, yPos, halfWidth, 8, 'F');
    pdf.rect(margin + halfWidth, yPos, halfWidth, 8, 'F');

    pdf.line(margin + halfWidth, yPos, margin + halfWidth, yPos + 8);
    pdf.line(margin, yPos + 8, pageWidth - margin, yPos + 8);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(17, 24, 39);
    pdf.text('Total Earnings', margin + 4, yPos + 5.5);
    pdf.text(`₹${formatCurrency(slipData.earnings.gross)}`, margin + halfWidth - 4, yPos + 5.5, { align: 'right' });

    pdf.text('Total Deductions', margin + halfWidth + 4, yPos + 5.5);
    pdf.setTextColor(220, 38, 38); // text-red-600
    pdf.text(`₹${formatCurrency(slipData.deductions.total)}`, pageWidth - margin - 4, yPos + 5.5, { align: 'right' });

    // Complete outer border
    pdf.setDrawColor(209, 213, 219);
    pdf.setLineWidth(0.3);
    pdf.rect(margin, tableY, contentWidth, yPos - tableY + 8, 'S');

    yPos += 14;

    // ============ NET PAYABLE ============
    const netBoxWidth = contentWidth / 2;
    const netBoxX = pageWidth - margin - netBoxWidth;

    pdf.setFillColor(239, 246, 255); // bg-blue-50
    pdf.setDrawColor(191, 219, 254); // border-blue-100
    pdf.setLineWidth(0.3);
    pdf.roundedRect(netBoxX, yPos, netBoxWidth, 18, 2, 2, 'FD');

    // Net Pay text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 64, 175); // text-blue-800
    pdf.text('NET PAYABLE', netBoxX + 4, yPos + 7);

    pdf.setFontSize(16);
    pdf.setTextColor(17, 24, 39); // text-gray-900
    pdf.text(`₹${formatCurrency(slipData.netPay)}`, netBoxX + netBoxWidth - 4, yPos + 7, { align: 'right' });

    // In Words
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128); // text-gray-500
    pdf.setFont('helvetica', 'italic');
    const wordsText = `In Words: ${toWords(slipData.netPay)} Only`;
    pdf.text(wordsText, netBoxX + netBoxWidth - 4, yPos + 14, { align: 'right', maxWidth: netBoxWidth - 8 });

    yPos += 28;

    // Footer
    pdf.setFontSize(7);
    pdf.setTextColor(156, 163, 175); // text-gray-400
    pdf.setFont('helvetica', 'normal');
    pdf.text('COMPUTER GENERATED DOCUMENT', pageWidth / 2, yPos, { align: 'center' });

    return pdf;
};

export const generateSlipPdfBase64 = (slipData) => {
    const pdf = generateSlipPdf(slipData);
    const pdfArrayBuffer = pdf.output("arraybuffer");
    const pdfBytes = new Uint8Array(pdfArrayBuffer);
    let binary = '';
    for (let i = 0; i < pdfBytes.byteLength; i++) {
        binary += String.fromCharCode(pdfBytes[i]);
    }
    return Buffer.from(binary, 'binary').toString('base64');
};
