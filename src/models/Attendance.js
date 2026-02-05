import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  clockIn: {
    type: Date,
  },
  clockOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: [
      "present",
      "absent",
      "half_day",
      "lop",
      "cl",
      "sl",
      "el",
      "pl",
      "holiday",
    ],
    default: "present",
  },
  source: {
    type: String,
    enum: ["self", "admin", "worklog"],
    default: "self",
  },
  note: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one record per user per day
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Update the updatedAt field on save
AttendanceSchema.pre("save", async function () {
  this.updatedAt = Date.now();
});

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
