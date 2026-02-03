import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import PayrollSettings from "@/models/PayrollSettings";
import { calculateCompleteSalary } from "@/lib/payrollCalculations";

export async function GET(req) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const hasPayrollAccess =
      session.user.role === "admin" ||
      session.user.permissions?.includes("payroll");

    if (!hasPayrollAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch settings first
    let settings = await PayrollSettings.findOne({ companyId: "default" });
    if (!settings) {
      settings = await PayrollSettings.create({ companyId: "default" });
    }

    // Fetch all users with salary data
    const pipeline = [
      {
        $lookup: {
          from: "employeesalaries",
          localField: "_id",
          foreignField: "userId",
          as: "salaryData",
        },
      },
      {
        $unwind: {
          path: "$salaryData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    const employeesRaw = await User.aggregate(pipeline);

    let totalEmployees = 0;
    let employeesWithSalary = 0;
    let totalMonthlyPayroll = 0;
    let totalDeductions = 0;
    let totalNetPayable = 0;

    employeesRaw.forEach((user) => {
      totalEmployees++;
      const salary = user.salaryData;

      if (salary) {
        employeesWithSalary++;
        const calculated = calculateCompleteSalary(salary, settings);
        totalMonthlyPayroll += calculated.gross;
        totalDeductions += calculated.deductions.total;
        totalNetPayable += calculated.netSalary;
      }
    });

    const stats = {
      totalEmployees,
      employeesWithSalary,
      totalMonthlyPayroll,
      totalDeductions,
      totalNetPayable,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching payroll stats:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
