import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    taskName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["Completed", "In Progress", "Follow-up", "Not Started"],
        default: "Not Started"
    },
    startDate: {
        type: Date
    },
    completedDate: {
        type: Date
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    remarks: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Auto-update project completion when task status changes
TaskSchema.post('save', async function (doc) {
    const Project = mongoose.model("Project");
    const project = await Project.findById(doc.projectId);
    if (project) {
        await project.updateCompletionPercent();
    }
});

TaskSchema.post('remove', async function (doc) {
    const Project = mongoose.model("Project");
    const project = await Project.findById(doc.projectId);
    if (project) {
        await project.updateCompletionPercent();
    }
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
