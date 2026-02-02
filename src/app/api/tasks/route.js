import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Task from "@/models/Task";
import Project from "@/models/Project";
import WorkLog from "@/models/WorkLog";
import { auth } from "@/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // Permission check: Admin or Project Manager of the target project
    const project = await Project.findById(data.projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (
      session.user.role?.toLowerCase() !== "admin" &&
      project.projectManager?.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const newTask = await Task.create(data);
    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
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
    const status = searchParams.get("status");
    const assignedTo = searchParams.get("assignedTo");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const filterAll = searchParams.get("all") === "true";


    let query = {};

    // If regular user (non-admin)
    if (session.user.role?.toLowerCase() !== "admin") {
      // Find projects managed by this user
      const managedProjects = await Project.find({
        projectManager: session.user.id,
      }).select("_id");
      const managedProjectIds = managedProjects.map((p) => p._id);

      // Show task if:
      // 1. User is assigned to the task
      // 2. OR User is Project Manager of the task's project
      query.$or = [
        { assignedTo: session.user.id },
        { projectId: { $in: managedProjectIds } },
      ];
    }

    // Apply filters
    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    let queryExec = Task.find(query)
      .populate("projectId", "name")
      .populate("assignedTo", "name email")
      .populate("completedBy", "name email")
      .sort({ createdAt: -1 });

    if (!filterAll) {
      const skip = (page - 1) * limit;
      queryExec = queryExec.skip(skip).limit(limit);
    }

    const tasks = await queryExec;

    return NextResponse.json({ success: true, data: tasks });
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
    const { id, ...data } = await req.json();

    // Find task and check permissions
    const existingTask = await Task.findById(id).populate("projectId");
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Permission check: Admin or Project Manager of the task's project
    const projectId = existingTask.projectId._id || existingTask.projectId;
    const project = await Project.findById(projectId);

    if (
      session.user.role?.toLowerCase() !== "admin" &&
      project?.projectManager?.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const task = await Task.findByIdAndUpdate(id, data, { new: true })
      .populate("projectId", "name")
      .populate("assignedTo", "name email")
      .populate("completedBy", "name email");

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(req) {
  try {
    const session = await auth(); // Added session check for DELETE
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Permission check: Admin or Project Manager
    const project = await Project.findById(existingTask.projectId);
    if (
      session.user.role?.toLowerCase() !== "admin" &&
      project?.projectManager?.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Task.findByIdAndDelete(id);

    // Also delete associated work logs
    await WorkLog.deleteMany({ taskId: id });

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
