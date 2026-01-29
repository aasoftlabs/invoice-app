import mongoose from "mongoose";

const salarySlipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },

    // Salary structure snapshot (at time of generation)
    salaryStructure: {
        basic: Number,
        da: Number,
        hra: Number,
        conveyanceAllowance: Number,
        specialAllowance: Number,
        medicalAllowance: Number,
        mobileExpense: Number,
        distanceAllowance: Number,
        bonus: Number,
        arrears: Number,
        otherAllowances: [
            {
                name: String,
                amount: Number,
            },
        ],
        state: String,
        taxRegime: String,
    },

    // Attendance details
    totalDays: {
        type: Number,
        required: true,
    },
    presentDays: {
        type: Number,
        required: true,
    },
    paidDays: {
        type: Number,
        required: true,
    },
    lopDays: {
        type: Number,
        default: 0,
    },

    // Calculated earnings (after LOP adjustment)
    earnings: {
        basic: Number,
        da: Number,
        hra: Number,
        conveyanceAllowance: Number,
        specialAllowance: Number,
        medicalAllowance: Number,
        mobileExpense: Number,
        distanceAllowance: Number,
        bonus: Number,
        arrears: Number,
        otherAllowances: [
            {
                name: String,
                amount: Number,
            },
        ],
        gross: Number,
    },

    // Deductions
    deductions: {
        pf: Number,
        esi: Number,
        pt: Number,
        tds: Number,
        lop: Number,
        loan: Number,
        advance: Number,
        otherDeductions: [
            {
                name: String,
                amount: Number,
            },
        ],
        total: Number,
    },

    // Net pay
    netPay: {
        type: Number,
        required: true,
    },

    // Generation details
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    generatedAt: {
        type: Date,
        default: Date.now,
    },

    // Status tracking
    status: {
        type: String,
        enum: ["draft", "finalized", "paid"],
        default: "finalized",
    },
    paidOn: {
        type: Date,
    },

    // Notes
    notes: {
        type: String,
    },
});

// Index for quick lookup
salarySlipSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
salarySlipSchema.index({ status: 1 });

const SalarySlip =
    mongoose.models.SalarySlip ||
    mongoose.model("SalarySlip", salarySlipSchema);

export default SalarySlip;
