import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Project from "@/models/Project";
import Task from "@/models/Task";
import WorkLog from "@/models/WorkLog";
import { auth } from "@/auth";

export async function GET(req) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const year = searchParams.get("year") || new Date().getFullYear();
        const month = searchParams.get("month");
        const userId = searchParams.get("userId");

        // Build query for filtering
        let workLogQuery = {};
        if (session.user.role !== "admin") {
            workLogQuery.userId = session.user.id;
        } else if (userId) {
            workLogQuery.userId = userId;
        }

        // Total counts
        const totalProjects = await Project.countDocuments();
        const completedProjects = await Project.countDocuments({ status: "Completed" });
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: "Completed" });

        // Get current active project/task (most recent work log)
        const latestWorkLog = await WorkLog.findOne(workLogQuery)
            .sort({ date: -1 })
            .populate("projectId", "name")
            .populate("taskId", "taskName");

        // Monthly graph data - count of projects and tasks per month for the year
        const monthlyData = [];
        for (let m = 1; m <= 12; m++) {
            const startOfMonth = new Date(year, m - 1, 1);
            const endOfMonth = new Date(year, m, 0, 23, 59, 59);

            const monthWorkLogQuery = {
                ...workLogQuery,
                date: { $gte: startOfMonth, $lte: endOfMonth }
            };

            const monthWorkLogs = await WorkLog.find(monthWorkLogQuery);
            const uniqueProjects = [...new Set(monthWorkLogs.map(log => log.projectId.toString()))];
            const uniqueTasks = [...new Set(monthWorkLogs.map(log => log.taskId.toString()))];

            monthlyData.push({
                month: m,
                projectCount: uniqueProjects.length,
                taskCount: uniqueTasks.length
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalProjects,
                    completedProjects,
                    totalTasks,
                    completedTasks
                },
                currentActive: {
                    project: latestWorkLog?.projectId?.name || "N/A",
                    task: latestWorkLog?.taskId?.taskName || "N/A"
                },
                monthlyData
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 },
        );
    }
}
