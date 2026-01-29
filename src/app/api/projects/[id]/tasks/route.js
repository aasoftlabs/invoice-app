import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { auth } from "@/auth";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Get all tasks for this project
        const tasks = await Task.find({ projectId: id })
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
