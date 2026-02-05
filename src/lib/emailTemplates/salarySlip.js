export const getSalarySlipPdfTemplate = (slip) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const monthName = new Date(slip.year, slip.month - 1).toLocaleString(
    "default",
    { month: "long" },
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #eeeeee; }
    .title { font-size: 20px; font-weight: bold; color: #333; margin-top: 10px; }
    .subtitle { font-size: 16px; color: #666; margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: bold; background-color: #f8f9fa; padding: 8px; margin-top: 20px; border: 1px solid #dee2e6; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
    .info-table td { padding: 8px; border: 1px solid #dee2e6; }
    .info-label { font-weight: bold; background-color: #f8f9fa; width: 30%; }
    .amount-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .amount-table th { background-color: #f8f9fa; padding: 8px; border: 1px solid #dee2e6; text-align: left; }
    .amount-table td { padding: 8px; border: 1px solid #dee2e6; }
    .amount-col { text-align: right; }
    .total-row { font-weight: bold; background-color: #e9ecef; }
    .net-pay { font-size: 18px; font-weight: bold; text-align: center; padding: 15px; background-color: #e3f2fd; color: #0d47a1; margin-top: 20px; border-radius: 4px; }
    .footer { text-align: center; font-size: 12px; color: #999999; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px;">
        <img src="https://aasoftlabs.com/logo.png" alt="AASoftLabs" style="height: 50px; width: auto;" />
        <div>
          <span style="color: #2563eb; font-size: 24px; font-weight: bold;">AA</span>
          <span style="color: #4b5563; font-size: 24px; font-weight: bold;">SoftLabs</span>
          <sup style="color: #9ca3af; font-size: 10px; margin-left: 2px;">™</sup>
        </div>
      </div>
      <div class="title">Payslip for ${monthName} ${slip.year}</div>
    </div>

    <!-- Employee Details -->
    <table class="info-table">
      <tr>
        <td class="info-label">Name</td>
        <td>${slip.userId.name}</td>
        <td class="info-label">Employee ID</td>
        <td>${slip.userId.employeeId || "N/A"}</td>
      </tr>
      <tr>
        <td class="info-label">Department</td>
        <td>${slip.userId.department || "General"}</td>
        <td class="info-label">Designation</td>
        <td>${slip.userId.designation || "N/A"}</td>
      </tr>
      <tr>
        <td class="info-label">Worked Days</td>
        <td>${slip.presentDays} Days</td>
        <td class="info-label">Paid Days</td>
        <td>${slip.paidDays} Days</td>
      </tr>
    </table>

    <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #dee2e6;">
      <tr>
        <td width="50%" valign="top" style="border-right: 1px solid #dee2e6;">
          <div class="section-title" style="margin-top: 0; border: none; border-bottom: 1px solid #dee2e6;">Earnings</div>
          <table class="amount-table" style="border: none;">
            <tr>
              <td>Basic Salary</td>
              <td class="amount-col">${formatCurrency(slip.earnings.basic)}</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td class="amount-col">${formatCurrency(slip.earnings.hra)}</td>
            </tr>
            <tr>
              <td>DA</td>
              <td class="amount-col">${formatCurrency(slip.earnings.da)}</td>
            </tr>
            ${slip.earnings.conveyanceAllowance > 0
      ? `<tr><td>Conveyance</td><td class="amount-col">${formatCurrency(slip.earnings.conveyanceAllowance)}</td></tr>`
      : ""
    }
            ${slip.earnings.medicalAllowance > 0
      ? `<tr><td>Medical</td><td class="amount-col">${formatCurrency(slip.earnings.medicalAllowance)}</td></tr>`
      : ""
    }
            ${slip.earnings.specialAllowance > 0
      ? `<tr><td>Special Allowance</td><td class="amount-col">${formatCurrency(slip.earnings.specialAllowance)}</td></tr>`
      : ""
    }
             ${slip.earnings.mobileExpense > 0
      ? `<tr><td>Mobile Expense</td><td class="amount-col">${formatCurrency(slip.earnings.mobileExpense)}</td></tr>`
      : ""
    }
            ${slip.earnings.bonus > 0
      ? `<tr><td>Bonus</td><td class="amount-col">${formatCurrency(slip.earnings.bonus)}</td></tr>`
      : ""
    }
             ${slip.earnings.arrears > 0
      ? `<tr><td>Arrears</td><td class="amount-col">${formatCurrency(slip.earnings.arrears)}</td></tr>`
      : ""
    }
            ${slip.earnings.otherAllowances
      .map(
        (allowance) =>
          `<tr><td>${allowance.name}</td><td class="amount-col">${formatCurrency(allowance.amount)}</td></tr>`,
      )
      .join("")}
          </table>
        </td>
        <td width="50%" valign="top">
          <div class="section-title" style="margin-top: 0; border: none; border-bottom: 1px solid #dee2e6;">Deductions</div>
           <table class="amount-table" style="border: none;">
            <tr>
              <td>PF</td>
              <td class="amount-col">${formatCurrency(slip.deductions.pf)}</td>
            </tr>
             <tr>
              <td>Professional Tax</td>
              <td class="amount-col">${formatCurrency(slip.deductions.pt)}</td>
            </tr>
             <tr>
              <td>TDS</td>
              <td class="amount-col">${formatCurrency(slip.deductions.tds)}</td>
            </tr>
             ${slip.deductions.esi > 0
      ? `<tr><td>ESI</td><td class="amount-col">${formatCurrency(slip.deductions.esi)}</td></tr>`
      : ""
    }
             ${slip.deductions.loan > 0
      ? `<tr><td>Loan Repayment</td><td class="amount-col">${formatCurrency(slip.deductions.loan)}</td></tr>`
      : ""
    }
              ${slip.deductions.advance > 0
      ? `<tr><td>Salary Advance</td><td class="amount-col">${formatCurrency(slip.deductions.advance)}</td></tr>`
      : ""
    }
               ${slip.deductions.lop > 0
      ? `<tr><td>Loss of Pay</td><td class="amount-col">${formatCurrency(slip.deductions.lop)}</td></tr>`
      : ""
    }
            ${slip.deductions.otherDeductions
      .map(
        (deduction) =>
          `<tr><td>${deduction.name}</td><td class="amount-col">${formatCurrency(deduction.amount)}</td></tr>`,
      )
      .join("")}
          </table>
        </td>
      </tr>
      <tr class="total-row">
        <td style="padding: 10px; border-right: 1px solid #dee2e6; border-top: 1px solid #dee2e6;">
           <div style="display: flex; justify-content: space-between;">
            <span>Gross Earnings</span>
            <span>${formatCurrency(slip.earnings.gross)}</span>
           </div>
        </td>
         <td style="padding: 10px; border-top: 1px solid #dee2e6;">
           <div style="display: flex; justify-content: space-between;">
            <span>Total Deductions</span>
            <span>${formatCurrency(slip.deductions.total)}</span>
           </div>
        </td>
      </tr>
    </table>

    <div class="net-pay">
      Net Pay: ${formatCurrency(slip.netPay)}
    </div>
    
     ${slip.notes
      ? `<div style="margin-top: 20px; font-size: 14px; color: #555;"><strong>Note:</strong> ${slip.notes}</div>`
      : ""
    }

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} AASoftLabs. All rights reserved.</p>
      <p>This checks stub is computer generated.</p>
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
       <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px;">
         <img src="https://aasoftlabs.com/logo.png" alt="AASoftLabs" style="height: 50px; width: auto;" />
         <div>
           <span style="color: #2563eb; font-size: 24px; font-weight: bold;">AA</span>
           <span style="color: #4b5563; font-size: 24px; font-weight: bold;">SoftLabs</span>
           <sup style="color: #9ca3af; font-size: 10px; margin-left: 2px;">™</sup>
         </div>
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
