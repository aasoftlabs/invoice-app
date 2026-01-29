import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import EmployeeSalary from "@/models/EmployeeSalary";
import User from "@/models/User";
import PayrollSettings from "@/models/PayrollSettings";
import { calculateCompleteSalary } from "@/lib/payrollCalculations";

// GET: Get all employees with their salary structures
export async function GET(req) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // Check if user has payroll permission
        const hasPayrollAccess =
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        if (!hasPayrollAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch all users with their salary structures
        const users = await User.find({}).select("-password").lean();
        console.log(`[Payroll API] Found ${users.length} users`);

        // Fetch salary structures for all users
        const salaries = await EmployeeSalary.find({}).lean();

        // Fetch payroll settings
        let settings = await PayrollSettings.findOne({ companyId: "default" });
        if (!settings) {
            // Create default settings if not exists
            settings = await PayrollSettings.create({ companyId: "default" });
        }

        // Combine user data with salary data
        const employeesWithSalary = users.map((user) => {
            const salary = salaries.find(
                (s) => s.userId.toString() === user._id.toString()
            );

            if (salary) {
                // Calculate complete salary
                const calculated = calculateCompleteSalary(salary, settings);

                return {
                    ...user,
                    salary: {
                        ...salary,
                        grossSalary: calculated.gross,
                        totalDeductions: calculated.deductions.total,
                        netSalary: calculated.netSalary,
                    },
                };
            }

            return {
                ...user,
                salary: null,
            };
        });

        return NextResponse.json({
            employees: employeesWithSalary,
            settings,
        });
    } catch (error) {
        console.error("Error fetching payroll data:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
