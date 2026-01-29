import mongoose from "mongoose";

const payrollSettingsSchema = new mongoose.Schema({
    companyId: {
        type: String,
        default: "default",
        unique: true,
    },

    // PF Settings
    pfRate: {
        type: Number,
        default: 12, // 12%
        min: 0,
        max: 100,
    },
    pfBasicThreshold: {
        type: Number,
        default: 15000, // PF applicable if basic >= 15000
    },

    // ESI Settings
    esiEmployeeRate: {
        type: Number,
        default: 0.75, // 0.75%
        min: 0,
        max: 100,
    },
    esiEmployerRate: {
        type: Number,
        default: 3.25, // 3.25%
        min: 0,
        max: 100,
    },
    esiGrossThreshold: {
        type: Number,
        default: 21000, // ESI applicable if gross <= 21000
    },

    // State-wise Professional Tax Configuration
    ptStates: [
        {
            state: {
                type: String,
                required: true,
            },
            slabs: [
                {
                    minSalary: {
                        type: Number,
                        required: true,
                    },
                    maxSalary: {
                        type: Number,
                        required: true,
                    },
                    amount: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },
    ],

    // Financial Year Settings
    financialYearStart: {
        type: Date,
        default: () => new Date(new Date().getFullYear(), 3, 1), // April 1st
    },

    // TDS Settings
    defaultTaxRegime: {
        type: String,
        enum: ["old", "new"],
        default: "new",
    },
    standardDeduction: {
        type: Number,
        default: 50000, // ₹50,000 in old regime
    },

    standardDeduction: {
        type: Number,
        default: 50000, // ₹50,000 in old regime
    },
}, { timestamps: true });

const PayrollSettings =
    mongoose.models.PayrollSettings ||
    mongoose.model("PayrollSettings", payrollSettingsSchema);

export default PayrollSettings;
