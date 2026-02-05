import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user.role !== "admin" &&
        !session.user.permissions?.includes("payroll"))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month"));
    const year = parseInt(searchParams.get("year"));

    if (isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: "Month and year are required" },
        { status: 400 },
      );
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    // Aggregate LOP counts: absent=1, lop=1, half_day=0.5
    const userLopCounts = {};

    records.forEach((rec) => {
      const userId = rec.userId.toString();
      let weight = 0;

      if (rec.status === "absent" || rec.status === "lop") {
        weight = 1;
      } else if (rec.status === "half_day") {
        weight = 0.5;
      }

      if (weight > 0) {
        userLopCounts[userId] = (userLopCounts[userId] || 0) + weight;
      }
    });

    return NextResponse.json({ success: true, userLopCounts });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance summary" },
      { status: 500 },
    );
  }
}
