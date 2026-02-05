import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Attendance from "@/models/Attendance";
import { markAttendance } from "@/lib/attendanceUtils";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    if (!Attendance) {
      throw new Error("Attendance model not initialized");
    }

    const userId = session.user.id;

    // Auto-mark attendance using utility
    const attendance = await markAttendance(userId, new Date(), "self");

    return NextResponse.json({
      message: attendance.clockOut
        ? "Clock-out updated"
        : "Clock-in successful",
      attendance,
    });
  } catch (error) {
    console.error("DETAILED ATTENDANCE ERROR:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: error.message || "Failed to mark attendance" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = session.user.id;

    // Fetch user's attendance for the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const records = await Attendance.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: 1 });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}
