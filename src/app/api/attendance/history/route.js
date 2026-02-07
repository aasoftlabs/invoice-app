import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Attendance from "@/models/Attendance";
import { getUserPermissions } from "@/lib/permissions";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permissions = getUserPermissions(session.user);
    const isAdmin =
      session.user.role === "admin" || permissions.includes("payroll");

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Default to current month if no dates provided, or fetch all?
    // The "My Attendance" view fetches the current month by default in `mark/route.js`
    // but actually `mark/route.js` GET implementation fetches current month.
    // Let's support month/year filtering or default to current month.

    const now = new Date();
    let start, end;

    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    if (monthParam && yearParam) {
      const year = parseInt(yearParam);
      const month = parseInt(monthParam); // 1-12
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const records = await Attendance.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 }); // Newest first

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance history" },
      { status: 500 },
    );
  }
}
