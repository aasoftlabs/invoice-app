import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Project from "@/models/Project";
import Task from "@/models/Task";
import WorkLog from "@/models/WorkLog";
import { auth } from "@/auth";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const project = await Project.findById(id)
            .populate("createdBy", "name email");

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Get tasks count
        const tasks = await Task.find({ projectId: id });
        const completedTasks = tasks.filter(t => t.status === "Completed").length;

        // Get unique team members who worked on this project
        const workLogs = await WorkLog.find({ projectId: id })
            .populate("userId", "name email avatar")
            .distinct("userId");

        return NextResponse.json({
            success: true,
            data: {
                project,
                stats: {
                    totalTasks: tasks.length,
                    completedTasks,
                    completionPercent: project.completionPercent,
                    teamMembers: workLogs
                }
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}
