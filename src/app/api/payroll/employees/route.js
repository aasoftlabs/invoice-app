import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
// EmployeeSalary and PayrollSettings import kept for reference or used if needed
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const state = searchParams.get("state") || "all";
    const department = searchParams.get("department") || "all";
    const filterAll = searchParams.get("all") === "true"; // If true, ignore pagination

    // Fetch settings first
    let settings = await PayrollSettings.findOne({ companyId: "default" });
    if (!settings) {
      settings = await PayrollSettings.create({ companyId: "default" });
    }

    const pipeline = [];

    // 1. Match Users (Search & Basic Filters)
    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }
    if (state !== "all") {
      // User state
      matchStage.state = state;
    }
    if (department !== "all") {
      matchStage.department = department;
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Exclude users with enablePayroll: false
    pipeline.push({ $match: { enablePayroll: { $ne: false } } });

    // 2. Lookup Salary
    pipeline.push({
      $lookup: {
        from: "employeesalaries",
        localField: "_id",
        foreignField: "userId",
        as: "salaryData",
      },
    });

    // 3. Unwind (preserve users without salary for setup_pending)
    pipeline.push({
      $unwind: {
        path: "$salaryData",
        preserveNullAndEmptyArrays: true,
      },
    });

    // 4. Lookup Latest Salary Slip (for current month status)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    pipeline.push({
      $lookup: {
        from: "salaryslips",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", "$$userId"] },
                  { $eq: ["$month", currentMonth] },
                  { $eq: ["$year", currentYear] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "latestSlip",
      },
    });

    pipeline.push({
      $unwind: {
        path: "$latestSlip",
        preserveNullAndEmptyArrays: true,
      },
    });

    // 5. Filter by Salary Status
    if (status === "with_salary") {
      pipeline.push({ $match: { salaryData: { $exists: true, $ne: null } } });
    } else if (status === "setup_pending") {
      pipeline.push({ $match: { salaryData: { $exists: false } } }); // or check null
    }

    // 5. Pagination
    if (!filterAll) {
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
    }

    // Execute Aggregation
    const employeesRaw = await User.aggregate(pipeline);

    // Process results to match format and calculate specifics
    const employees = employeesRaw.map((user) => {
      const salary = user.salaryData;
      let finalSalary = null;

      if (salary) {
        const calculated = calculateCompleteSalary(salary, settings);
        finalSalary = {
          ...salary,
          grossSalary: calculated.gross,
          totalDeductions: calculated.deductions.total,
          netSalary: calculated.netSalary,
        };
      }

      // Clean up user object (remove salaryData, password)
      const { salaryData, latestSlip, password, ...userFields } = user;
      return {
        ...userFields,
        salary: finalSalary,
        latestSlip: latestSlip
          ? {
              _id: latestSlip._id,
              status: latestSlip.status,
              month: latestSlip.month,
              year: latestSlip.year,
              paidOn: latestSlip.paidOn,
            }
          : null,
      };
    });

    return NextResponse.json({
      employees,
      settings,
    });
  } catch (error) {
    console.error("Error fetching payroll data:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
