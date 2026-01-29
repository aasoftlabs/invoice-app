import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Task from "@/models/Task";
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

        const newTask = await Task.create(data);
        return NextResponse.json(
            { success: true, data: newTask },
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
        const status = searchParams.get("status");
        const assignedTo = searchParams.get("assignedTo");

        let query = {};
        if (projectId) query.projectId = projectId;
        if (status) query.status = status;
        if (assignedTo) query.assignedTo = assignedTo;

        const tasks = await Task.find(query)
            .populate("projectId", "name")
            .populate("assignedTo", "name email")
            .populate("completedBy", "name email")
            .sort({ createdAt: -1 });

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

        const task = await Task.findByIdAndUpdate(id, data, { new: true })
            .populate("projectId", "name")
            .populate("assignedTo", "name email")
            .populate("completedBy", "name email");

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

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
        const session = await auth();
        if (!session || session.user.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

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
