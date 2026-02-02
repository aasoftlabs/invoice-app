import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    client: {
      type: String,
      required: true,
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
    endDate: {
      type: Date,
    },
    completionPercent: {
      type: Number,
      default: 0,
    },
    refLink: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance
ProjectSchema.index({ status: 1, createdAt: -1 });
ProjectSchema.index({ client: 1 });
ProjectSchema.index({ projectManager: 1 });
ProjectSchema.index({ createdBy: 1 });

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
