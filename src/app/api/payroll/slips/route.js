import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import SalarySlip from "@/models/SalarySlip";
import EmployeeSalary from "@/models/EmployeeSalary";
import User from "@/models/User";
import PayrollSettings from "@/models/PayrollSettings";
import {
  calculateCompleteSalary,
  calculateLOP,
} from "@/lib/payrollCalculations";

// GET: Get all salary slips (with filters)
export async function GET(req) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const status = searchParams.get("status");

    // Build query
    let query = {};

    // Check permission
    const hasPayrollAccess =
      session.user.role === "admin" ||
      session.user.permissions?.includes("payroll");

    if (!hasPayrollAccess) {
      // User can only see their own slips
      query.userId = session.user.id;
    } else if (userId) {
      // Payroll user can filter by userId
      query.userId = userId;
    }

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const slips = await SalarySlip.find(query)
      .populate("userId", "name email designation")
      .populate("generatedBy", "name")
      .sort({ year: -1, month: -1 })
      .lean();

    return NextResponse.json({ success: true, slips });
  } catch (error) {
    console.error("Error fetching slips:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Generate salary slip for a user
export async function POST(req) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Only users with payroll permission can generate slips
    const canGenerate =
      session.user.role === "admin" ||
      session.user.permissions?.includes("payroll");

    if (!canGenerate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      userId,
      month,
      year,
      lopDays = 0,
      notes,
      overwrite = false,
    } = await req.json();

    // Validate
    if (!userId || !month || !year) {
      return NextResponse.json(
        { error: "userId, month, and year are required" },
        { status: 400 },
      );
    }

    // Check if slip already exists
    const existingSlip = await SalarySlip.findOne({ userId, month, year });
    if (existingSlip && !overwrite) {
      return NextResponse.json(
        { error: "Salary slip already exists for this month" },
        { status: 400 },
      );
    }
    // const { userId, month, year, lopDays = 0, notes } = await req.json();

    // I should correct the replacement to just modify the logic after line 83.

    // Fetch user
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch salary structure
    const salaryStructure = await EmployeeSalary.findOne({ userId }).lean();
    if (!salaryStructure) {
      return NextResponse.json(
        { error: "Salary structure not found for this user" },
        { status: 404 },
      );
    }

    // Fetch settings
    const settings = await PayrollSettings.findOne({ companyId: "default" });

    // If overwrite is requested and slip exists, delete it first to ensure clean recreation
    if (existingSlip && overwrite) {
      await SalarySlip.findByIdAndDelete(existingSlip._id);
    }

    // Calculate total days in month
    const totalDays = new Date(year, month, 0).getDate();
    const presentDays = totalDays - lopDays;

    // Calculate salary with LOP
    const calculated = calculateCompleteSalary(
      salaryStructure,
      settings,
      lopDays,
    );

    // Use Full Earnings (Standard)
    // We do NOT reduce earnings pro-rata. LOP is shown as a deduction.
    const earnings = {
      basic: salaryStructure.basic,
      da: salaryStructure.da || 0,
      hra: salaryStructure.hra || 0,
      conveyanceAllowance: salaryStructure.conveyanceAllowance || 0,
      specialAllowance: salaryStructure.specialAllowance || 0,
      medicalAllowance: salaryStructure.medicalAllowance || 0,
      mobileExpense: salaryStructure.mobileExpense || 0,
      distanceAllowance: salaryStructure.distanceAllowance || 0,
      bonus: salaryStructure.bonus || 0,
      arrears: salaryStructure.arrears || 0,
      otherAllowances: salaryStructure.otherAllowances || [],
      gross: calculated.gross, // Full Gross
    };

    // Deductions (Calculated utility already includes LOP in total)
    const deductions = {
      pf: calculated.deductions.pf,
      esi: calculated.deductions.esi,
      pt: calculated.deductions.pt,
      tds: calculated.deductions.tds,
      lop: calculated.deductions.lop, // Correct LOP Amount
      loan: salaryStructure.loanDeduction || 0,
      advance: salaryStructure.advanceDeduction || 0,
      otherDeductions: salaryStructure.otherDeductions || [],
      total: calculated.deductions.total, // Correct Total (Includes LOP)
    };

    // Create salary slip
    const slip = await SalarySlip.create({
      userId,
      month,
      year,
      salaryStructure: {
        basic: salaryStructure.basic,
        da: salaryStructure.da,
        hra: salaryStructure.hra,
        conveyanceAllowance: salaryStructure.conveyanceAllowance,
        specialAllowance: salaryStructure.specialAllowance,
        medicalAllowance: salaryStructure.medicalAllowance,
        mobileExpense: salaryStructure.mobileExpense,
        distanceAllowance: salaryStructure.distanceAllowance,
        bonus: salaryStructure.bonus,
        arrears: salaryStructure.arrears,
        otherAllowances: salaryStructure.otherAllowances,
        state: salaryStructure.state,
        taxRegime: salaryStructure.taxRegime,
      },
      totalDays,
      presentDays,
      paidDays: presentDays,
      lopDays,
      earnings,
      deductions,
      netPay: calculated.netSalary,
      generatedBy: session.user.id,
      status: "finalized",
      notes,
    });

    const populatedSlip = await SalarySlip.findById(slip._id)
      .populate("userId", "name email designation")
      .populate("generatedBy", "name")
      .lean();

    return NextResponse.json({
      success: true,
      slip: populatedSlip,
    });
  } catch (error) {
    console.error("Error generating slip:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
