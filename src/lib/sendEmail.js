import { Resend } from "resend";
import { getPasswordResetTemplate } from "./emailTemplates/passwordReset";
import { getSalarySlipEmailBody } from "./emailTemplates/salarySlip";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "security@aasoftlabs.com",
    to: email,
    subject: "Reset your password",
    html: getPasswordResetTemplate(resetUrl),
  });
};

export const sendSalarySlipEmail = async (email, slipData, pdfBase64 = null) => {
  const monthName = new Date(slipData.year, slipData.month - 1).toLocaleString(
    "default",
    { month: "long" },
  );

  try {
    if (!pdfBase64) {
      throw new Error("PDF must be generated client-side. Please open the slip view to send email.");
    }



    // Send email with attachment
    // Send email with attachment
    const resendStartTime = Date.now();
    await resend.emails.send({
      from: "hrd@aasoftlabs.com",
      to: email,
      subject: `Payslip for ${monthName} ${slipData.year} - AASoftLabs`,
      html: getSalarySlipEmailBody(slipData),
      attachments: [
        {
          filename: `Payslip_${monthName}_${slipData.year}.pdf`,
          content: pdfBase64,
        },
      ],
    });
    const resendEndTime = Date.now();

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

    // Convert buffer to base64 string (required by Resend API)
    const pdfBase64 = pdfBuffer.toString('base64');

    return {
      from: "hrd@aasoftlabs.com",
      to: email,
      subject: `Payslip for ${monthName} ${slipData.year} - AASoftLabs`,
      html: getSalarySlipEmailBody(slipData),
      attachments: [
        {
          filename: `Payslip_${monthName}_${slipData.year}.pdf`,
          content: pdfBase64,
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
