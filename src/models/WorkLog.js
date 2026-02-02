import mongoose from "mongoose";

const WorkLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    details: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["Completed", "In Progress", "Follow-up", "Not Started"],
        required: true
    },
    remarks: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Auto-update task and project when work log is created
WorkLogSchema.post('save', async function (doc) {
    try {
        const Task = mongoose.model("Task");
        const Project = mongoose.model("Project");

        // Update task status and dates
        const task = await Task.findById(doc.taskId);
        if (task) {
            // Update task status to latest from work log
            task.status = doc.status;

            // Set start date if not set
            if (!task.startDate) {
                task.startDate = doc.date;
            }

            // Set completion date if status is completed
            if (doc.status === "Completed" && !task.completedDate) {
                task.completedDate = doc.date;
                task.completedBy = doc.userId;
            }

            await task.save();
        }

        // Update project start/end dates and status
        const project = await Project.findById(doc.projectId);
        if (project) {
            const WorkLog = mongoose.model("WorkLog");

            // Get all work logs for this project sorted by date
            const allLogs = await WorkLog.find({ projectId: doc.projectId }).sort({ date: 1 });

            if (allLogs.length > 0) {
                // First log date = start date
                project.startDate = allLogs[0].date;
                // Last log date = end date
                project.endDate = allLogs[allLogs.length - 1].date;
            }

            // Update project status based on tasks
            const allTasks = await Task.find({ projectId: doc.projectId });
            if (allTasks.length > 0) {
                const completedTasks = allTasks.filter(t => t.status === 'Completed').length;

                if (completedTasks === allTasks.length) {
                    // All tasks completed
                    project.status = 'Completed';
                } else if (completedTasks > 0 || allTasks.some(t => t.status === 'In Progress')) {
                    // At least one task in progress or completed
                    project.status = 'In Progress';
                }
            }

            await project.save();
        }
    } catch (error) {
        console.error('Error in WorkLog post-save hook:', error);
    }
});

// Indexes
WorkLogSchema.index({ projectId: 1, date: 1 });
WorkLogSchema.index({ taskId: 1 });
WorkLogSchema.index({ userId: 1 });
WorkLogSchema.index({ date: -1 });

export default mongoose.models.WorkLog || mongoose.model("WorkLog", WorkLogSchema);
