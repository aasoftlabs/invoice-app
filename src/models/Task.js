import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    taskName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Follow-up", "Not Started"],
      default: "Not Started",
    },
    startDate: {
      type: Date,
    },
    completedDate: {
      type: Date,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-update project completion when task status changes
TaskSchema.post("save", async function (doc) {
  try {
    const Project = mongoose.model("Project");
    const Task = mongoose.model("Task");

    // Get all tasks for this project
    const tasks = await Task.find({ projectId: doc.projectId });

    if (tasks.length > 0) {
      // Weighted calculation: Completed=1, In Progress=0.5, Not Started/Follow-up=0
      let totalPoints = 0;
      tasks.forEach((task) => {
        if (task.status === "Completed") {
          totalPoints += 1;
        } else if (task.status === "In Progress") {
          totalPoints += 0.5;
        }
      });

      // Calculate percentage
      const completionPercent = Math.round((totalPoints / tasks.length) * 100);

      // Determine project status
      let projectStatus = "Not Started";
      if (completionPercent === 100) {
        projectStatus = "Completed";
      } else if (completionPercent > 0) {
        projectStatus = "In Progress";
      }

      // Update project
      await Project.findByIdAndUpdate(doc.projectId, {
        completionPercent: completionPercent,
        status: projectStatus,
      });
    }
  } catch (error) {
    console.error("Error updating project completion:", error);
  }
});

TaskSchema.post("remove", async function (doc) {
  try {
    const Project = mongoose.model("Project");
    const Task = mongoose.model("Task");

    // Get all tasks for this project
    const tasks = await Task.find({ projectId: doc.projectId });

    if (tasks.length > 0) {
      // Weighted calculation
      let totalPoints = 0;
      tasks.forEach((task) => {
        if (task.status === "Completed") {
          totalPoints += 1;
        } else if (task.status === "In Progress") {
          totalPoints += 0.5;
        }
      });

      const completionPercent = Math.round((totalPoints / tasks.length) * 100);

      let projectStatus = "Not Started";
      if (completionPercent === 100) {
        projectStatus = "Completed";
      } else if (completionPercent > 0) {
        projectStatus = "In Progress";
      }

      await Project.findByIdAndUpdate(doc.projectId, {
        completionPercent: completionPercent,
        status: projectStatus,
      });
    } else {
      // No tasks left, reset to 0%
      await Project.findByIdAndUpdate(doc.projectId, {
        completionPercent: 0,
        status: "Not Started",
      });
    }
  } catch (error) {
    console.error("Error updating project completion:", error);
  }
});

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
