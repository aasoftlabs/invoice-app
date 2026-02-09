import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Attendance from "@/models/Attendance";

// DELETE - User can delete their own attendance record, admin can delete anyone's
export async function DELETE(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const dateQuery = searchParams.get("date");
        const targetUserId = searchParams.get("userId"); // Optional: admin can specify userId

        if (!dateQuery) {
            return NextResponse.json({ error: "Date is required" }, { status: 400 });
        }

        const isAdmin =
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        // Determine which user's record to delete
        const userId = isAdmin && targetUserId ? targetUserId : session.user.id;

        const targetDate = new Date(dateQuery);
        targetDate.setHours(0, 0, 0, 0);

        const result = await Attendance.findOneAndDelete({
            userId,
            date: targetDate,
        });

        if (!result) {
            return NextResponse.json(
                { error: "Attendance record not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "Attendance record deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting attendance:", error);
        return NextResponse.json(
            { error: "Failed to delete attendance" },
            { status: 500 },
        );
    }
}
