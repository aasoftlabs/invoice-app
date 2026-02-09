import mongoose from "mongoose";

const BalanceSheetItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ["Fixed Asset", "Current Asset", "Long-term Liability", "Current Liability", "Equity"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.models.BalanceSheetItem ||
  mongoose.model("BalanceSheetItem", BalanceSheetItemSchema);
