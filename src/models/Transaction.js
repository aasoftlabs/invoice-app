import mongoose from "mongoose";
import { CATEGORY_IDS } from "@/lib/accountingCategories";

const TransactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    type: {
        type: String,
        enum: ["Credit", "Debit"], // Credit = Income, Debit = Expense
        required: true,
    },
    // accountingCategory: structured ID from accountingCategories.js
    // Drives auto-generation of Balance Sheet & P&L.
    // Nullable for backward compatibility with old transactions.
    accountingCategory: {
        type: String,
        enum: [...CATEGORY_IDS, null],
        default: null,
    },
    category: {
        type: String,
        required: true, // human-friendly label, e.g. "Invoice Payment"
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    paymentMode: {
        type: String,
        enum: ["Cash", "Bank Transfer", "UPI", "Cheque", "Other"],
        default: "Bank Transfer",
    },

    // Reference to source document (Invoice, SalarySlip, etc.)
    reference: {
        type: {
            type: String,
            enum: ["Invoice", "SalarySlip", "None"],
            default: "None",
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        documentNo: {
            type: String
        }
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
});

// Indexes
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1 });
TransactionSchema.index({ "reference.id": 1 });
TransactionSchema.index({ category: 1 });

export default mongoose.models.Transaction ||
    mongoose.model("Transaction", TransactionSchema);
