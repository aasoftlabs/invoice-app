import mongoose from "mongoose";

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
    category: {
        type: String,
        required: true, // e.g., "Invoice Payment", "Salary", "Office Expense"
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
            // Dynamic ref based on type is complex in mongoose, so we keep it generic or handle in app logic
            // verification usually done manually
        },
        documentNo: {
            type: String // Optional text reference (e.g. Invoice No) for display
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

export default mongoose.models.Transaction ||
    mongoose.model("Transaction", TransactionSchema);
