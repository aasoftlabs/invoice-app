import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import { getISTDate } from "@/lib/dateUtils";

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
    const dateQuery = searchParams.get("date");

    if (!dateQuery) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const targetDate = getISTDate(new Date(dateQuery));

    // Fetch all employees enabled for payroll
    const employees = await User.find({ enablePayroll: { $ne: false } }).select(
      "name email employeeId designation joiningDate",
    );

    // Fetch attendance for this date
    const records = await Attendance.find({ date: targetDate });

    // Merge employee data with attendance records
    const data = employees.map((emp) => {
      const record = records.find(
        (r) => r.userId.toString() === emp._id.toString(),
      );
      return {
        _id: emp._id,
        name: emp.name,
        employeeId: emp.employeeId,
        designation: emp.designation,
        joiningDate: emp.joiningDate,
        attendance: record || null,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching admin attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance data" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
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
    const body = await req.json();
    const { userId, date, status, note, clockIn, clockOut } = body;

    if (!userId || !date || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const targetDate = getISTDate(new Date(date));

    const today = getISTDate(new Date());

    if (targetDate > today) {
      return NextResponse.json(
        { error: "Cannot mark attendance for future dates" },
        { status: 400 },
      );
    }

    // Fetch user to check joining date
    const user = await User.findById(userId).select("joiningDate");
    if (user?.joiningDate) {
      const joiningDate = new Date(user.joiningDate);
      joiningDate.setHours(0, 0, 0, 0);
      if (targetDate < joiningDate) {
        return NextResponse.json(
          { error: "Cannot mark attendance before joining date" },
          { status: 400 },
        );
      }
    }

    const updateData = {
      status,
      note,
      source: "admin",
      updatedAt: Date.now(),
    };

    if (clockIn) {
      const [h, m] = clockIn.split(":").map(Number);
      const cIn = new Date(targetDate);
      cIn.setHours(h, m, 0, 0);
      updateData.clockIn = cIn;
    }

    if (clockOut) {
      const [h, m] = clockOut.split(":").map(Number);
      const cOut = new Date(targetDate);
      cOut.setHours(h, m, 0, 0);
      updateData.clockOut = cOut;
    }

    const attendance = await Attendance.findOneAndUpdate(
      { userId, date: targetDate },
      updateData,
      { upsert: true, new: true },
    );

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 },
    );
  }
}
