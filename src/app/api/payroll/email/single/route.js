import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SalarySlip from "@/models/SalarySlip";
import User from "@/models/User";
import { sendSalarySlipEmail } from "@/lib/sendEmail";
import { generatePdf } from "@/lib/pdfGenerator";
import { getSalarySlipPdfTemplate } from "@/lib/emailTemplates/salarySlip";

export async function POST(req) {
  try {
    const session = await auth();

    if (
      !session ||
      (session.user.role !== "admin" &&
        !session.user.permissions?.includes("payroll"))
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { slipId, pdfBase64 } = await req.json();

    if (!slipId) {
      return NextResponse.json(
        { message: "Slip ID is required" },
        { status: 400 },
      );
    }

    await connectDB();

    // Fetch slip with user details
    const slip = await SalarySlip.findById(slipId).populate(
      "userId",
      "name email designation department employeeId enablePayroll",
    );

    if (!slip) {
      return NextResponse.json(
        { message: "Salary slip not found" },
        { status: 404 },
      );
    }

    if (!slip.userId || !slip.userId.email) {
      return NextResponse.json(
        { message: "Employee email not found" },
        { status: 400 },
      );
    }

    // Check if slip is in a valid status for emailing
    if (slip.status === "draft") {
      return NextResponse.json(
        {
          message:
            "Cannot send email for draft salary slips. Please finalize the slip first.",
        },
        { status: 400 },
      );
    }

    if (slip.userId.enablePayroll === false) {
      return NextResponse.json(
        { message: "Payroll is disabled for this user" },
        { status: 400 },
      );
    }

    // Generate PDF server-side
    let finalPdfContent = pdfBase64;

    if (!finalPdfContent) {
      try {
        const htmlContent = getSalarySlipPdfTemplate(slip);
        const pdfBuffer = await generatePdf(htmlContent);
        finalPdfContent = pdfBuffer;
      } catch (err) {
        console.error("Error generating PDF:", err);
        throw err;
      }
    }

    // Send email with PDF (either from client or server-generated)
    await sendSalarySlipEmail(slip.userId.email, slip, finalPdfContent);

    // Update status
    slip.emailSent = true;
    slip.emailSentAt = new Date();
    await slip.save();

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending salary slip email:", error);
    return NextResponse.json(
      { message: `Internal Server Error: ${error.message}` },
      { status: 500 },
    );
  }
}
