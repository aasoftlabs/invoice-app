import mongoose from "mongoose";

const employeeSalarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    effectiveDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    state: {
        type: String,
        required: true,
        default: "Maharashtra", // For PT calculation
    },

    // Basic Components
    basic: {
        type: Number,
        required: true,
        min: 0,
    },
    da: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Allowances
    hra: {
        type: Number,
        default: 0,
        min: 0,
    },
    conveyanceAllowance: {
        type: Number,
        default: 0,
        min: 0,
    },
    specialAllowance: {
        type: Number,
        default: 0,
        min: 0,
    },
    medicalAllowance: {
        type: Number,
        default: 0,
        min: 0,
    },
    mobileExpense: {
        type: Number,
        default: 0,
        min: 0,
    },
    distanceAllowance: {
        type: Number,
        default: 0,
        min: 0,
    },
    bonus: {
        type: Number,
        default: 0,
        min: 0,
    },
    arrears: {
        type: Number,
        default: 0,
        min: 0,
    },
    otherAllowances: [
        {
            name: String,
            amount: {
                type: Number,
                min: 0,
            },
        },
    ],

    // Deductions (optional/manual)
    loanDeduction: {
        type: Number,
        default: 0,
        min: 0,
    },
    advanceDeduction: {
        type: Number,
        default: 0,
        min: 0,
    },
    otherDeductions: [
        {
            name: String,
            amount: {
                type: Number,
                min: 0,
            },
        },
    ],

    // Auto-calculated statutory deductions (stored for record)
    pf: {
        type: Number,
        default: 0,
        min: 0,
    },
    esi: {
        type: Number,
        default: 0,
        min: 0,
    },
    pt: {
        type: Number,
        default: 0,
        min: 0,
    },
    tds: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Totals (calculated)
    grossSalary: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalDeductions: {
        type: Number,
        default: 0,
        min: 0,
    },
    netSalary: {
        type: Number,
        default: 0,
        min: 0,
    },

    // Settings
    pfApplicable: {
        type: Boolean,
        default: true,
    },
    esiApplicable: {
        type: Boolean,
        default: false,
    },
    taxRegime: {
        type: String,
        enum: ["old", "new"],
        default: "new",
    },

    taxRegime: {
        type: String,
        enum: ["old", "new"],
        default: "new",
    },
}, { timestamps: true });

const EmployeeSalary =
    mongoose.models.EmployeeSalary ||
    mongoose.model("EmployeeSalary", employeeSalarySchema);

export default EmployeeSalary;
