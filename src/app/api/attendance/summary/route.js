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
    const month = searchParams.get("month")
      ? parseInt(searchParams.get("month"))
      : null;
    const year = parseInt(searchParams.get("year"));

    if (isNaN(year)) {
      return NextResponse.json({ error: "Year is required" }, { status: 400 });
    }

    let startDate, endDate;
    if (month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    }

    const records = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    });

    // Aggregate counts for all types
    const summary = {};

    records.forEach((rec) => {
      const userId = rec.userId.toString();
      if (!summary[userId]) {
        summary[userId] = {
          lop: 0,
          cl: 0,
          sl: 0,
          el: 0,
          pl: 0,
          holiday: 0,
          absent: 0,
          halfDay: 0,
          present: 0,
        };
      }

      const userStats = summary[userId];

      if (rec.status === "absent" || rec.status === "lop") {
        userStats.lop += 1;
        if (rec.status === "absent") userStats.absent += 1;
        else userStats.lop += 0; // already added to lop
      } else if (rec.status === "half_day") {
        userStats.lop += 0.5;
        userStats.halfDay += 1;
      } else if (userStats.hasOwnProperty(rec.status)) {
        userStats[rec.status] += 1;
      } else if (rec.status === "present") {
        userStats.present += 1;
      }
    });

    // For backward compatibility with userLopCounts
    const userLopCounts = {};
    Object.keys(summary).forEach((uid) => {
      userLopCounts[uid] = summary[uid].lop;
    });

    return NextResponse.json({ success: true, summary, userLopCounts });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance summary" },
      { status: 500 },
    );
  }
}
