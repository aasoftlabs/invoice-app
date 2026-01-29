import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Project from "@/models/Project";
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

        // Set createdBy to current user
        data.createdBy = session.user.id;

        // Auto-set status to "Not Started" - it will be managed automatically
        data.status = "Not Started";

        const newProject = await Project.create(data);
        return NextResponse.json(
            { success: true, data: newProject },
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
        const status = searchParams.get("status");
        const owner = searchParams.get("owner");
        const priority = searchParams.get("priority");

        let query = {};
        if (status) query.status = status;
        if (owner) query.client = owner;
        if (priority) query.priority = parseInt(priority);

        const projects = await Project.find(query)
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: projects });
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

        const project = await Project.findByIdAndUpdate(id, data, { new: true })
            .populate("createdBy", "name email");

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: project });
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

        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Also delete associated tasks and work logs
        await Task.deleteMany({ projectId: id });
        await WorkLog.deleteMany({ projectId: id });

        return NextResponse.json({ success: true, message: "Project deleted" });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}
