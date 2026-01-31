import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    startDateTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDateTime: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    share: {
      type: String,
      enum: ["private", "public"],
      default: "private",
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
