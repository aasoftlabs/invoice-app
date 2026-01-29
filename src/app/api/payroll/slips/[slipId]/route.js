import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import SalarySlip from "@/models/SalarySlip";

// GET: Get a specific salary slip
export async function GET(req, { params }) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { slipId } = await params;

        const slip = await SalarySlip.findById(slipId)
            .populate("userId", "name email designation state employeeId joiningDate")
            .populate("generatedBy", "name")
            .lean();

        if (!slip) {
            return NextResponse.json(
                { error: "Salary slip not found" },
                { status: 404 }
            );
        }

        // Check permission: user can view their own slip, or have payroll permission
        const canView =
            slip.userId._id.toString() === session.user.id ||
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        if (!canView) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json({ slip });
    } catch (error) {
        console.error("Error fetching slip:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// PUT: Update salary slip (for corrections)
export async function PUT(req, { params }) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { slipId } = await params;

        // Only users with payroll permission can update
        const canUpdate =
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        if (!canUpdate) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updates = await req.json();

        const slip = await SalarySlip.findByIdAndUpdate(slipId, updates, {
            new: true,
        })
            .populate("userId", "name email designation state employeeId joiningDate")
            .populate("generatedBy", "name")
            .lean();

        if (!slip) {
            return NextResponse.json(
                { error: "Salary slip not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, slip });
    } catch (error) {
        console.error("Error updating slip:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE: Delete salary slip
export async function DELETE(req, { params }) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { slipId } = await params;

        // Only admins can delete
        if (session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const slip = await SalarySlip.findByIdAndDelete(slipId);

        if (!slip) {
            return NextResponse.json(
                { error: "Salary slip not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Salary slip deleted",
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
