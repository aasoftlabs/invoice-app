import { Resend } from "resend";
import { getPasswordResetTemplate } from "./emailTemplates/passwordReset";
import {
  getSalarySlipPdfTemplate,
  getSalarySlipEmailBody,
} from "./emailTemplates/salarySlip";
import { generatePdf } from "./pdfGenerator";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "hrd@aasoftlabs.com",
    to: email,
    subject: "Reset your password",
    html: getPasswordResetTemplate(resetUrl),
  });
};

export const sendSalarySlipEmail = async (email, slipData) => {
  const monthName = new Date(slipData.year, slipData.month - 1).toLocaleString(
    "default",
    { month: "long" },
  );

  try {
    // Generate PDF
    const pdfHtml = getSalarySlipPdfTemplate(slipData);
    const pdfBuffer = await generatePdf(pdfHtml);

    // Send email with attachment
    await resend.emails.send({
      from: "payroll@aasoftlabs.com",
      to: email,
      subject: `Payslip for ${monthName} ${slipData.year} - AASoftLabs`,
      html: getSalarySlipEmailBody(slipData),
      attachments: [
        {
          filename: `Payslip_${monthName}_${slipData.year}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    });
  } catch (error) {
    console.error("Error in sendSalarySlipEmail:", error);
    throw error;
  }
};

export const sendBulkSalarySlipEmails = async (items) => {
  // items: array of { email, slipData, pdfBuffer }

  if (!items || items.length === 0) return;

  const batchPayload = items.map(({ email, slipData, pdfBuffer }) => {
    const monthName = new Date(
      slipData.year,
      slipData.month - 1,
    ).toLocaleString("default", { month: "long" });

    return {
      from: "payroll@aasoftlabs.com",
      to: email,
      subject: `Payslip for ${monthName} ${slipData.year} - AASoftLabs`,
      html: getSalarySlipEmailBody(slipData),
      attachments: [
        {
          filename: `Payslip_${monthName}_${slipData.year}.pdf`,
          content: pdfBuffer,
        },
      ],
    };
  });

  try {
    const { data, error } = await resend.batch.send(batchPayload);

    if (error) {
      console.error("Error in batch send:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in sendBulkSalarySlipEmails:", error);
    throw error;
  }
};
