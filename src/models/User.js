import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String },
  state: {
    type: String,
    default: "Maharashtra", // For state-wise PT calculation
  },
  department: { type: String, default: "General" },
  employeeId: { type: String, unique: true, sparse: true }, // Custom Employee ID (e.g., EMP001)
  joiningDate: { type: Date },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  permissions: {
    type: [String],
    default: ["project", "profile"],
    // Available permissions: invoices, letterhead, project, company, users, payroll, profile, notes
    // If user has "project" permission, they can access all /project/* pages
    // If user has "invoices" permission, they can access all /invoices/* pages
    // If user has "payroll" permission, they can access all /payroll/* pages and manage all employees
    // All users can see their own payroll data regardless of permission
  },
  avatar: { type: String }, // URL or Base64
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  lastResetRequest: { type: Date }, // For rate limiting
  createdAt: { type: Date, default: Date.now },
});

// Indexes
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
