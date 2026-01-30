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
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
    const userId = searchParams.get("userId");

    // Build base queries based on role
    let projectQuery = {};
    let taskQuery = {};
    let workLogQuery = {};

    if (session.user.role?.toLowerCase() !== "admin") {
      // Find projects managed by this user
      const managedProjects = await Project.find({
        projectManager: session.user.id,
      }).select("_id");
      const managedProjectIds = managedProjects.map((p) => p._id.toString());

      // Find projects where user has assigned tasks
      const userTasks = await Task.find({ assignedTo: session.user.id }).select(
        "projectId",
      );
      const assignedProjectIds = userTasks.map((t) => t.projectId.toString());

      const allAccessibleProjectIds = [
        ...new Set([...managedProjectIds, ...assignedProjectIds]),
      ];

      if (managedProjectIds.length > 0) {
        // It's a Project Manager (has managed projects)
        // They see:
        // 1. Projects: Managed ones + Assigned ones
        projectQuery._id = { $in: allAccessibleProjectIds };

        // 2. Tasks: In managed projects OR assigned to them
        taskQuery.$or = [
          { projectId: { $in: managedProjectIds } },
          { assignedTo: session.user.id },
        ];

        // 3. Work Logs: In managed projects OR their own
        workLogQuery.$or = [
          { projectId: { $in: managedProjectIds } },
          { userId: session.user.id },
        ];
      } else {
        // Regular User
        // 1. Projects: Only where they have tasks
        projectQuery._id = { $in: assignedProjectIds };

        // 2. Tasks: Only assigned to them
        taskQuery.assignedTo = session.user.id;

        // 3. Work Logs: Only their own
        workLogQuery.userId = session.user.id;
      }
    }

    // Apply specific user filter if requested (by Admin mainly, or PM filtering within their scope)
    if (userId) {
      // If regular user tries to filter by another user, ignore it/restrict it
      if (session.user.role?.toLowerCase() === "admin") {
        taskQuery.assignedTo = userId;
        workLogQuery.userId = userId;
      } else {
        // PM could potentially filter by user if that user is in their project?
        // For simplicity, let's keep the base role restrictions paramount.
        // If a PM filters by userId, we intersect: (User X) AND (In Managed Projects)
        // But existing logic "taskQuery.assignedTo = targetUserId" might override permissions if not careful.
        // Let's safe-guard:
        if (taskQuery.$or) {
          // PM case: (Managed OR Assigned) AND (Target User)
          // This is complex to merge. Simplification:
          // If PM filters by user, show that user's tasks ONLY within managed projects.
          taskQuery = {
            projectId: { $in: projectQuery._id?.$in || [] }, // Accessible projects
            assignedTo: userId,
          };
          workLogQuery = {
            projectId: { $in: projectQuery._id?.$in || [] },
            userId: userId,
          };
        } else {
          taskQuery.assignedTo = userId;
          workLogQuery.userId = userId;
        }
      }
    }

    // Get statistics
    const totalProjects = await Project.countDocuments(projectQuery);
    const completedProjects = await Project.countDocuments({
      ...projectQuery,
      status: "Completed",
    });
    const totalTasks = await Task.countDocuments(taskQuery);
    const completedTasks = await Task.countDocuments({
      ...taskQuery,
      status: "Completed",
    });

    // Get monthly data for the year
    const monthlyData = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const month = i + 1;
        const startOfMonth = new Date(year, i, 1);
        const endOfMonth = new Date(year, i + 1, 0, 23, 59, 59);

        const workLogs = await WorkLog.countDocuments({
          ...workLogQuery,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const tasks = await Task.countDocuments({
          ...taskQuery,
          status: "Completed",
          completedDate: { $gte: startOfMonth, $lte: endOfMonth },
        });

        return {
          month: new Date(year, i).toLocaleString("default", {
            month: "short",
          }),
          workLogs,
          tasks,
        };
      }),
    );

    // Get current active project/task (most recent work log)
    const recentLog = await WorkLog.findOne(workLogQuery)
      .sort({ date: -1 })
      .populate("projectId", "name")
      .populate("taskId", "taskName");

    const currentActive = {
      project: recentLog?.projectId?.name || "No active project",
      task: recentLog?.taskId?.taskName || "No active task",
    };

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          completedProjects,
          totalTasks,
          completedTasks,
        },
        monthlyData,
        currentActive,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
