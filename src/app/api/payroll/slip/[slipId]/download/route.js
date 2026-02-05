import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SalarySlip from "@/models/SalarySlip";
import { getSalarySlipPdfTemplate } from "@/lib/emailTemplates/salarySlip";
import { generatePdf } from "@/lib/pdfGenerator";

export async function GET(req, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { slipId } = await params;

    // Fetch slip with user details
    const slip = await SalarySlip.findById(slipId).populate(
      "userId",
      "name email designation department employeeId",
    );

    if (!slip) {
      return NextResponse.json(
        { error: "Salary slip not found" },
        { status: 404 },
      );
    }

    // Check authorization - admin or own slip
    if (
      session.user.role !== "admin" &&
      slip.userId._id.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate PDF
    const pdfHtml = getSalarySlipPdfTemplate(slip);
    const pdfBuffer = await generatePdf(pdfHtml);

    // Return PDF as download
    const fileName = `Payslip_${slip.userId.name}_${slip.month}_${slip.year}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
