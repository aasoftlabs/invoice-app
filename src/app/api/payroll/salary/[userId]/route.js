import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import EmployeeSalary from "@/models/EmployeeSalary";
import User from "@/models/User";
import PayrollSettings from "@/models/PayrollSettings";
import { calculateCompleteSalary } from "@/lib/payrollCalculations";

// GET: Get salary structure for a specific user
export async function GET(req, { params }) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { userId } = await params;

        // Check permission: user can view their own salary, or have payroll permission
        const canView =
            session.user.id === userId ||
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        if (!canView) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const user = await User.findById(userId).select("-password").lean();
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Auto-generate employee ID if not set
        let employeeId = user.employeeId;
        if (!employeeId) {
            const totalUsers = await User.countDocuments();
            employeeId = `EMP${String(totalUsers).padStart(3, '0')}`;
        }

        let salary = await EmployeeSalary.findOne({ userId }).lean();

        // Fetch settings for calculation
        let settings = await PayrollSettings.findOne({ companyId: "default" });
        if (!settings) {
            settings = await PayrollSettings.create({ companyId: "default" });
        }

        if (salary) {
            const calculated = calculateCompleteSalary(salary, settings);
            salary = {
                ...salary,
                grossSalary: calculated.gross,
                totalDeductions: calculated.deductions.total,
                netSalary: calculated.netSalary,
            };
        }

        return NextResponse.json({
            user: { ...user, employeeId },
            salary,
            settings
        });
    } catch (error) {
        console.error("Error fetching salary:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// PUT: Update salary structure for a user
export async function PUT(req, { params }) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { userId } = await params;

        // Only users with payroll permission can update
        const canUpdate =
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        if (!canUpdate) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        let user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const data = await req.json();

        // Update User details if provided
        if (data.employeeId || data.department || data.joiningDate) {
            user.employeeId = data.employeeId || user.employeeId;
            user.department = data.department || user.department;
            user.joiningDate = data.joiningDate || user.joiningDate;
            await user.save();
        }

        // Fetch settings
        const settings = await PayrollSettings.findOne({ companyId: "default" });

        // Calculate final values
        const calculated = calculateCompleteSalary(data, settings);

        // Update or create salary structure
        let salary = await EmployeeSalary.findOne({ userId });

        if (salary) {
            // Update existing
            Object.assign(salary, {
                ...data,
                state: data.state || user.state,
                grossSalary: calculated.gross,
                pf: calculated.deductions.pf,
                esi: calculated.deductions.esi,
                pt: calculated.deductions.pt,
                tds: calculated.deductions.tds,
                totalDeductions: calculated.deductions.total,
                netSalary: calculated.netSalary,
                updatedAt: Date.now(),
            });
            await salary.save();
        } else {
            // Create new
            salary = await EmployeeSalary.create({
                userId,
                ...data,
                state: data.state || user.state,
                grossSalary: calculated.gross,
                pf: calculated.deductions.pf,
                esi: calculated.deductions.esi,
                pt: calculated.deductions.pt,
                tds: calculated.deductions.tds,
                totalDeductions: calculated.deductions.total,
                netSalary: calculated.netSalary,
            });
        }

        return NextResponse.json({
            success: true,
            salary: salary.toObject(),
        });
    } catch (error) {
        console.error("Error updating salary:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete salary structure
export async function DELETE(req, { params }) {
    const session = await auth();

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { userId } = await params;

        const salary = await EmployeeSalary.findOneAndDelete({ userId });

        if (!salary) {
            return NextResponse.json(
                { error: "Salary structure not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Salary structure deleted",
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
