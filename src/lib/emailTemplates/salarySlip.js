export const getSalarySlipPdfTemplate = (slip) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const toWords = (num) => {
    if (!num) return "Zero";
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if ((num = num.toString()).length > 9) return "overflow";
    const n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred "
        : "";
    str +=
      n[5] != 0
        ? (str != "" ? "and " : "") +
          (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
        : "";
    return str.trim();
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[slip.month - 1];

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper for generating rows - using a simpler table structure for PDF
  const renderAmountRow = (label, amount) => {
    if (amount === undefined || amount === null || amount === 0) return "";
    return `
      <tr>
        <td style="padding: 8px 16px; color: #374151; border-bottom: 1px solid #f3f4f6;">${label}</td>
        <td style="padding: 8px 16px; text-align: right; font-weight: 500; color: #111827; border-bottom: 1px solid #f3f4f6;">₹${formatCurrency(amount)}</td>
      </tr>
    `;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background-color: #ffffff; margin: 0; padding: 0; color: #1f2937; }
    .container { width: 100%; padding: 20px; background-color: #ffffff; }
    
    /* Header */
    .header-table { width: 100%; border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 32px; }
    .brand { vertical-align: top; }
    .company-name-row { font-size: 0; }
    .aa-text { color: #2563eb; font-size: 24px; font-weight: bold; }
    .softlabs-text { color: #4b5563; font-size: 24px; font-weight: bold; }
    .tm { color: #9ca3af; font-size: 10px; margin-left: 2px; vertical-align: top; }
    .slogan { color: #2563eb; font-size: 9px; font-weight: bold; text-transform: uppercase; margin-top: 2px; }
    .tagline { font-size: 10px; color: #6b7280; text-transform: uppercase; margin-top: 2px; font-weight: 500; letter-spacing: 0.05em; }
    
    .address-cell { text-align: right; vertical-align: top; font-size: 10px; color: #6b7280; line-height: 1.5; max-width: 250px; }
    .reg-office { font-weight: 600; color: #4b5563; }

    /* Title */
    .slip-title { text-align: center; font-size: 18px; font-weight: 600; color: #1e40af; text-transform: uppercase; margin-bottom: 32px; letter-spacing: 0.025em; }

    /* Employee Details Grid */
    .details-grid { width: 100%; margin-bottom: 32px; border-collapse: separate; border-spacing: 0; }
    .details-col { width: 45%; vertical-align: top; }
    .spacer-col { width: 10%; }
    
    .detail-row { width: 100%; border-bottom: 1px dashed #e5e7eb; padding-bottom: 4px; margin-bottom: 12px; display: block; }
    .detail-label { color: #6b7280; font-size: 14px; float: left; }
    .detail-value { font-weight: 600; color: #111827; font-size: 14px; float: right; text-align: right; }
    .clearfix::after { content: ""; clear: both; display: table; }

    /* Salary Table */
    .salary-container { border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; margin-bottom: 32px; }
    .salary-header-table { width: 100%; background-color: #f9fafb; border-bottom: 1px solid #d1d5db; }
    .salary-header-cell { width: 50%; padding: 12px; text-align: center; font-weight: 700; font-size: 12px; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; }
    .border-right { border-right: 1px solid #d1d5db; }
    
    .salary-body-table { width: 100%; border-collapse: collapse; }
    .earnings-cell { width: 50%; vertical-align: top; border-right: 1px solid #d1d5db; padding: 0; }
    .deductions-cell { width: 50%; vertical-align: top; padding: 0; }
    
    .component-table { width: 100%; border-collapse: collapse; }
    .th-row { background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; }
    .th-comp { text-align: left; padding: 8px 16px; font-size: 12px; color: #6b7280; font-weight: 500; }
    .th-amt { text-align: right; padding: 8px 16px; font-size: 12px; color: #6b7280; font-weight: 500; }

    /* Totals */
    .total-row-container { width: 100%; background-color: #f9fafb; border-top: 1px solid #d1d5db; font-weight: 700; color: #111827; font-size: 14px; }
    .total-cell { width: 50%; padding: 12px 16px; }
    .flex-between { display: block; overflow: hidden; }
    .float-left { float: left; }
    .float-right { float: right; }
    .text-red { color: #dc2626; }

    /* Net Pay */
    .net-pay-container { width: 100%; text-align: right; margin-bottom: 32px; }
    .net-pay-box { display: inline-block; background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px; width: 48%; text-align: left; }
    .net-pay-header { margin-bottom: 4px; overflow: hidden; }
    .net-label { float: left; font-size: 14px; font-weight: 600; color: #1e40af; text-transform: uppercase; margin-top: 4px; }
    .net-amount { float: right; font-size: 24px; font-weight: 700; color: #111827; }
    .amount-words { text-align: right; font-size: 12px; color: #6b7280; font-style: italic; font-weight: 500; margin-top: 4px; }

    /* Footer */
    .footer { position: fixed; bottom: 0; left: 0; right: 0; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; background-color: #ffffff; padding-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td class="brand">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right: 12px;">
                 <img src="https://aasoftlabs.com/logo.png" alt="AASoftLabs" style="height: 64px; width: auto;" />
              </td>
              <td style="vertical-align: top;">
                <div class="company-name-row">
                  <span class="aa-text">AA</span>
                  <span class="softlabs-text">SoftLabs</span>
                  <sup class="tm">™</sup>
                </div>
                <!-- Hardcoded Tagline for now as per preview -->
                 <div class="tagline">TRADING NAME OF ADMINASHU SOFTLABS</div>
                 <div class="slogan">NEXT-GEN WEB & MOBILE ENGINEERING</div>
              </td>
            </tr>
          </table>
        </td>
        <td class="address-cell">
          <span class="reg-office">Reg. Office:</span> C/O Anuj Kumar, 2nd Floor, Indrapuri<br/>
          Dasratha, Sipara, Patna Gaya Rd, Near SR Garden,<br/>
          Phulwari Sharif, Patna-800020
        </td>
      </tr>
    </table>

    <!-- Title -->
    <div class="slip-title">
      PAYSLIP FOR ${monthName.toUpperCase()} ${slip.year}
    </div>

    <!-- Employee Details -->
    <table class="details-grid">
      <tr>
        <td class="details-col">
          <div class="detail-row clearfix"><span class="detail-label">Employee Name:</span> <span class="detail-value">${slip.userId.name}</span></div>
          <div class="detail-row clearfix"><span class="detail-label">Employee ID:</span> <span class="detail-value">${slip.userId.employeeId || slip.userId._id.slice(-6).toUpperCase()}</span></div>
          <div class="detail-row clearfix"><span class="detail-label">Designation:</span> <span class="detail-value">${slip.userId.designation || "N/A"}</span></div>
          <div class="detail-row clearfix"><span class="detail-label">Department:</span> <span class="detail-value">General</span></div>
        </td>
        <td class="spacer-col"></td>
        <td class="details-col">
          <div class="detail-row clearfix"><span class="detail-label">Payslip No:</span> <span class="detail-value">${slip.userId.employeeId ? `${slip.userId.employeeId}-${slip.month}${slip.year}` : slip._id.slice(-6).toUpperCase()}</span></div>
          <div class="detail-row clearfix"><span class="detail-label">Date of Joining:</span> <span class="detail-value">${formatDate(slip.userId.joiningDate)}</span></div>
          <div class="detail-row clearfix"><span class="detail-label">Effective Work Days:</span> <span class="detail-value">${slip.presentDays}</span></div>
          <div class="detail-row clearfix"><span class="detail-label">Loss of Pay (Days):</span> <span class="detail-value" style="${slip.lopDays > 0 ? "color: #dc2626;" : ""}">${slip.lopDays}</span></div>
        </td>
      </tr>
    </table>

    <!-- Salary Table -->
    <div class="salary-container">
      <table class="salary-header-table" cellpadding="0" cellspacing="0">
        <tr>
          <td class="salary-header-cell border-right">Earnings</td>
          <td class="salary-header-cell">Deductions</td>
        </tr>
      </table>
      
      <table class="salary-body-table" cellpadding="0" cellspacing="0">
        <tr>
          <td class="earnings-cell">
            <table class="component-table">
              <tr class="th-row"><th class="th-comp">Component</th><th class="th-amt">Amount (₹)</th></tr>
              ${renderAmountRow("Basic Salary", slip.earnings.basic)}
              ${renderAmountRow("HRA", slip.earnings.hra)}
              ${renderAmountRow("DA", slip.earnings.da)}
              ${renderAmountRow("Conveyance", slip.earnings.conveyanceAllowance)}
              ${renderAmountRow("Special Allowance", slip.earnings.specialAllowance)}
              ${renderAmountRow("Medical Allowance", slip.earnings.medicalAllowance)}
              ${renderAmountRow("Mobile Expense", slip.earnings.mobileExpense)}
              ${renderAmountRow("Bonus", slip.earnings.bonus)}
              ${renderAmountRow("Arrears", slip.earnings.arrears)}
              ${slip.earnings.otherAllowances.map((a) => renderAmountRow(a.name, a.amount)).join("")}
               <!-- Fill remaining space if needed logic omitted for brevity -->
            </table>
          </td>
          <td class="deductions-cell">
             <table class="component-table">
              <tr class="th-row"><th class="th-comp">Component</th><th class="th-amt">Amount (₹)</th></tr>
              ${renderAmountRow("Provident Fund (PF)", slip.deductions.pf)}
              ${renderAmountRow("Professional Tax", slip.deductions.pt)}
              ${renderAmountRow("TDS", slip.deductions.tds)}
              ${renderAmountRow("ESI", slip.deductions.esi)}
              ${renderAmountRow("Loan Repayment", slip.deductions.loan)}
              ${renderAmountRow("Salary Advance", slip.deductions.advance)}
              ${renderAmountRow("Loss of Pay", slip.deductions.lop)}
              ${slip.deductions.otherDeductions.map((d) => renderAmountRow(d.name, d.amount)).join("")}
            </table>
          </td>
        </tr>
      </table>

      <!-- Totals Row -->
      <table class="total-row-container" cellpadding="0" cellspacing="0">
        <tr>
          <td class="total-cell border-right">
             <div class="flex-between">
               <span class="float-left">Total Earnings</span>
               <span class="float-right">₹${formatCurrency(slip.earnings.gross)}</span>
             </div>
          </td>
          <td class="total-cell">
             <div class="flex-between">
               <span class="float-left">Total Deductions</span>
               <span class="float-right text-red">₹${formatCurrency(slip.deductions.total)}</span>
             </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Net Pay -->
    <div class="net-pay-container">
      <div class="net-pay-box">
        <div class="net-pay-header clearfix">
          <span class="net-label">Net Payable</span>
          <span class="net-amount">₹${formatCurrency(slip.netPay)}</span>
        </div>
        <div class="amount-words">
          In Words: ${toWords(slip.netPay)} Only
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      This is a Computer Generated Document - No Signature Required
    </div>

  </div>
</body>
</html>
  `;
};

export const getSalarySlipEmailBody = (slip) => {
  const monthName = new Date(slip.year, slip.month - 1).toLocaleString(
    "default",
    { month: "long" },
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }
    .content { padding: 20px 0; color: #555555; line-height: 1.6; }
    .footer { text-align: center; font-size: 12px; color: #999999; margin-top: 20px; border-top: 1px solid #eeeeee; padding-top: 20px; }
    .highlight { font-weight: bold; color: #2563eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
       <div style="text-align: center; margin-bottom: 10px;">
         <img src="https://aasoftlabs.com/logo.png" alt="AASoftLabs" style="height: 20px; width: auto; vertical-align: middle;" />
         <span style="display: inline-block; vertical-align: middle; margin-left: 8px;">
           <span style="color: #2563eb; font-size: 24px; font-weight: bold;">AA</span>
           <span style="color: #4b5563; font-size: 24px; font-weight: bold;">SoftLabs</span>
           <sup style="color: #9ca3af; font-size: 10px; margin-left: 2px;">™</sup>
         </span>
      </div>
      <h3>Payslip for ${monthName} ${slip.year}</h3>
    </div>
    <div class="content">
      <p>Hello <strong>${slip.userId.name}</strong>,</p>
      <p>Your salary slip for <strong>${monthName} ${slip.year}</strong> has been generated.</p>
      
      <p style="font-size: 16px; margin: 20px 0;">
        Net Pay: <span class="highlight">${formatCurrency(slip.netPay)}</span>
      </p>

      <p>Please find the detailed payslip attached as a PDF.</p>
      <p>If you have any queries, please contact the HR department.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} AASoftLabs. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `;
};
