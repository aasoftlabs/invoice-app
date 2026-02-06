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

export const sendSalarySlipEmail = async (
  email,
  slipData,
  pdfContent = null,
) => {
  const monthName = new Date(slipData.year, slipData.month - 1).toLocaleString(
    "default",
    { month: "long" },
  );

  try {
    let attachmentContent = pdfContent;

    // Puppeteer v24+ returns Uint8Array, not Buffer.
    // Ensure we have a Buffer before checking/converting
    let attachmentBuffer = Buffer.from(attachmentContent);

    // Convert to base64 string (required by Resend API)
    // We always convert to base64 to be safe as Resend seems to prefer it for attachments in some contexts
    attachmentContent = attachmentBuffer.toString("base64");

    // Verify content exists
    if (!attachmentContent) {
      console.warn("No PDF content provided for salary slip email");
      // We can throw or continue without attachment depending on requirement.
      // For now, let's allow it but log a warning, or validly throw if attachment is mandatory.
      // Given previous logic threw error, we should probably keep attachment mandatory if that was the intent,
      // but now we expect it to be passed from server generation.
      if (!attachmentContent) {
        throw new Error("PDF content is missing.");
      }
    }

    // Send email with attachment
    const result = await resend.emails.send({
      from: "hrd@aasoftlabs.com",
      to: email,
      subject: `Payslip for ${monthName} ${slipData.year} - AASoftLabs`,
      html: getSalarySlipEmailBody(slipData),
      attachments: [
        {
          filename: `Payslip_${monthName}_${slipData.year}.pdf`,
          content: attachmentContent,
        },
      ],
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

    // Convert buffer to base64 string (required by Resend API)
    const pdfBase64 = pdfBuffer.toString("base64");

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
