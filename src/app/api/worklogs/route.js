import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import WorkLog from "@/models/WorkLog";
import Task from "@/models/Task";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Set userId to current user
    data.userId = session.user.id;

    const newWorkLog = await WorkLog.create(data);

    // Update task dates based on work log
    if (data.taskId) {
      const task = await Task.findById(data.taskId);
      if (task) {
        let taskUpdated = false;

        // Set start date on first log entry
        if (!task.startDate && data.date) {
          task.startDate = data.date;
          taskUpdated = true;
        }

        // Set completion date when status is Completed
        if (data.status === "Completed" && data.date) {
          task.completedDate = data.date;
          task.status = "Completed";
          taskUpdated = true;
        }

        if (taskUpdated) {
          await task.save();
        }
      }
    }

    const populatedLog = await WorkLog.findById(newWorkLog._id)
      .populate("userId", "name email")
      .populate("projectId", "name")
      .populate("taskId", "taskName");

    return NextResponse.json(
      { success: true, data: populatedLog },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filterAll = searchParams.get("all") === "true";


    let query = {};

    // Permission check: Regular users see only their own logs, Admin sees all
    if (session.user.role !== "admin") {
      query.userId = session.user.id;
    } else if (userId) {
      query.userId = userId;
    }

    if (projectId) query.projectId = projectId;
    if (taskId) query.taskId = taskId;

    // Date filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    let queryExec = WorkLog.find(query)
      .populate("userId", "name email")
      .populate("projectId", "name")
      .populate("taskId", "taskName")
      .sort({ date: -1 });

    if (!filterAll) {
      const skip = (page - 1) * limit;
      queryExec = queryExec.skip(skip).limit(limit);
    }

    const workLogs = await queryExec;

    return NextResponse.json({ success: true, data: workLogs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const data = await req.json();

    // Find the work log first
    const workLog = await WorkLog.findById(id);
    if (!workLog) {
      return NextResponse.json(
        { error: "Work log not found" },
        { status: 404 },
      );
    }

    // Permission check: Only owner can update
    if (workLog.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedLog = await WorkLog.findByIdAndUpdate(id, data, { new: true })
      .populate("userId", "name email")
      .populate("projectId", "name")
      .populate("taskId", "taskName");

    return NextResponse.json({ success: true, data: updatedLog });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const workLog = await WorkLog.findById(id);
    if (!workLog) {
      return NextResponse.json(
        { error: "Work log not found" },
        { status: 404 },
      );
    }

    // Permission check: Only owner or admin can delete
    if (
      session.user.role !== "admin" &&
      workLog.userId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await WorkLog.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Work log deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
