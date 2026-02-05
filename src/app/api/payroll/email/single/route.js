import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import SalarySlip from "@/models/SalarySlip";
import User from "@/models/User";
import { sendSalarySlipEmail } from "@/lib/sendEmail";

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

    const { slipId } = await req.json();

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
      "name email designation department employeeId enableEmail",
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

    if (slip.userId.enableEmail === false) {
      return NextResponse.json(
        { message: "Email sending is disabled for this user" },
        { status: 400 },
      );
    }

    // Prepare slip data for email template (flatten userId object if needed or pass as is because populate works)
    // The template expects slip.userId.name etc, which populate provides.

    await sendSalarySlipEmail(slip.userId.email, slip);

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
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
