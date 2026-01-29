/**
 * Payroll Calculation Utilities
 * Handles all salary calculations including PF, ESI, PT, TDS
 */

/**
 * Calculate Employee Provident Fund (PF)
 * @param {number} basic - Basic salary
 * @param {number} pfRate - PF rate (default 12%)
 * @param {number} threshold - Basic threshold (default 15000)
 * @returns {number} PF amount
 */
export function calculatePF(basic, pfRate = 12, threshold = 15000) {
    // If PF is applicable (function called), it's 12% of basic
    // Capping is optional but usually calculated on actual basic if basic < 15000
    // If basic > 15000, it's often capped at 1800, but let's stick to 12% of actual basic for now based on common usage or cap it
    // Updated logic: removed the "if basic < threshold return 0" check.

    // Optional: standard limit logic
    // if (basic > threshold) { return Math.round((threshold * pfRate) / 100); }

    return Math.round((basic * pfRate) / 100);
}

/**
 * Calculate Employee State Insurance (ESI)
 * @param {number} grossSalary - Gross salary
 * @param {number} esiRate - ESI employee rate (default 0.75%)
 * @param {number} threshold - Gross threshold (default 21000)
 * @returns {number} ESI amount
 */
export function calculateESI(grossSalary, esiRate = 0.75, threshold = 21000) {
    // Rely on the "ESI Applicable" flag from the user.
    // If they checked it, we calculate 0.75% regardless of salary.
    return Math.round((grossSalary * esiRate) / 100);
}

/**
 * Calculate Professional Tax (PT) based on state and salary
 * @param {number} grossSalary - Gross salary
 * @param {Array} ptSlabs - State-specific PT slabs
 * @returns {number} PT amount
 */
export function calculatePT(grossSalary, ptSlabs) {
    if (!ptSlabs || ptSlabs.length === 0) {
        return 0;
    }

    for (const slab of ptSlabs) {
        if (grossSalary >= slab.minSalary && grossSalary <= slab.maxSalary) {
            return slab.amount;
        }
    }

    // If salary exceeds all slabs, return the highest slab amount
    return ptSlabs[ptSlabs.length - 1]?.amount || 0;
}

/**
 * Default PT slabs for common states
 */
export const DEFAULT_PT_SLABS = {
    Maharashtra: [
        { minSalary: 0, maxSalary: 7500, amount: 0 },
        { minSalary: 7501, maxSalary: 10000, amount: 175 },
        { minSalary: 10001, maxSalary: Infinity, amount: 200 },
    ],
    Karnataka: [
        { minSalary: 0, maxSalary: 15000, amount: 0 },
        { minSalary: 15001, maxSalary: Infinity, amount: 200 },
    ],
    "Tamil Nadu": [
        { minSalary: 0, maxSalary: 21000, amount: 0 },
        { minSalary: 21001, maxSalary: Infinity, amount: 208 },
    ],
    "West Bengal": [
        { minSalary: 0, maxSalary: 10000, amount: 0 },
        { minSalary: 10001, maxSalary: 15000, amount: 110 },
        { minSalary: 15001, maxSalary: 25000, amount: 130 },
        { minSalary: 25001, maxSalary: 40000, amount: 150 },
        { minSalary: 40001, maxSalary: Infinity, amount: 200 },
    ],
    Gujarat: [
        { minSalary: 0, maxSalary: 5999, amount: 0 },
        { minSalary: 6000, maxSalary: 8999, amount: 80 },
        { minSalary: 9000, maxSalary: 11999, amount: 150 },
        { minSalary: 12000, maxSalary: Infinity, amount: 200 },
    ],
    Telangana: [
        { minSalary: 0, maxSalary: 15000, amount: 0 },
        { minSalary: 15001, maxSalary: Infinity, amount: 200 },
    ],
    "Andhra Pradesh": [
        { minSalary: 0, maxSalary: 15000, amount: 0 },
        { minSalary: 15001, maxSalary: Infinity, amount: 200 },
    ],
    Madhya_Pradesh: [
        { minSalary: 0, maxSalary: 15000, amount: 0 },
        { minSalary: 15001, maxSalary: Infinity, amount: 208 },
    ],
};

/**
 * Calculate Tax Deducted at Source (TDS) - New Tax Regime
 * @param {number} annualIncome - Annual gross income
 * @returns {number} Annual TDS amount
 */
export function calculateTDS_NewRegime(annualIncome) {
    let tax = 0;

    // New Tax Regime Slabs (2023-24)
    if (annualIncome <= 300000) {
        tax = 0;
    } else if (annualIncome <= 600000) {
        tax = (annualIncome - 300000) * 0.05;
    } else if (annualIncome <= 900000) {
        tax = 15000 + (annualIncome - 600000) * 0.1;
    } else if (annualIncome <= 1200000) {
        tax = 45000 + (annualIncome - 900000) * 0.15;
    } else if (annualIncome <= 1500000) {
        tax = 90000 + (annualIncome - 1200000) * 0.2;
    } else {
        tax = 150000 + (annualIncome - 1500000) * 0.3;
    }

    // Add 4% cess
    tax = tax * 1.04;

    return Math.round(tax);
}

/**
 * Calculate Tax Deducted at Source (TDS) - Old Tax Regime
 * @param {number} annualIncome - Annual gross income
 * @param {number} standardDeduction - Standard deduction (default 50000)
 * @param {number} otherDeductions - Other deductions (80C, etc.)
 * @returns {number} Annual TDS amount
 */
export function calculateTDS_OldRegime(
    annualIncome,
    standardDeduction = 50000,
    otherDeductions = 0
) {
    // Deduct standard deduction
    let taxableIncome = annualIncome - standardDeduction - otherDeductions;

    let tax = 0;

    // Old Tax Regime Slabs
    if (taxableIncome <= 250000) {
        tax = 0;
    } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }

    // Add 4% cess
    tax = tax * 1.04;

    return Math.round(tax);
}

/**
 * Calculate monthly TDS from annual TDS
 * @param {number} annualTDS - Annual TDS amount
 * @returns {number} Monthly TDS amount
 */
export function getMonthlyTDS(annualTDS) {
    return Math.round(annualTDS / 12);
}

/**
 * Calculate gross salary from all components
 * @param {Object} salaryComponents - Salary structure object
 * @returns {number} Gross salary
 */
export function calculateGrossSalary(salaryComponents) {
    const {
        basic = 0,
        da = 0,
        hra = 0,
        conveyanceAllowance = 0,
        specialAllowance = 0,
        medicalAllowance = 0,
        mobileExpense = 0,
        distanceAllowance = 0,
        bonus = 0,
        arrears = 0,
        otherAllowances = [],
    } = salaryComponents;

    // Sum all allowances
    const otherAllowancesTotal = otherAllowances.reduce(
        (sum, allowance) => sum + (allowance.amount || 0),
        0
    );

    const gross =
        basic +
        da +
        hra +
        conveyanceAllowance +
        specialAllowance +
        medicalAllowance +
        mobileExpense +
        distanceAllowance +
        bonus +
        arrears +
        otherAllowancesTotal;

    return Math.round(gross);
}

/**
 * Calculate total deductions
 * @param {Object} deductions - Deductions object
 * @returns {number} Total deductions
 */
export function calculateTotalDeductions(deductions) {
    const {
        pf = 0,
        esi = 0,
        pt = 0,
        tds = 0,
        lop = 0,
        loan = 0,
        advance = 0,
        otherDeductions = [],
    } = deductions;

    const otherDeductionsTotal = otherDeductions.reduce(
        (sum, deduction) => sum + (deduction.amount || 0),
        0
    );

    const total =
        pf +
        esi +
        pt +
        tds +
        lop +
        loan +
        advance +
        otherDeductionsTotal;

    return Math.round(total);
}

/**
 * Calculate LOP (Loss of Pay) deduction
 * @param {number} monthlySalary - Monthly gross salary
 * @param {number} totalDays - Total days in month
 * @param {number} lopDays - Number of LOP days
 * @returns {number} LOP amount
 */
export function calculateLOP(monthlySalary, totalDays, lopDays) {
    if (lopDays <= 0) return 0;
    const perDaySalary = monthlySalary / totalDays;
    return Math.round(perDaySalary * lopDays);
}

/**
 * Calculate net salary
 * @param {number} grossSalary - Gross salary
 * @param {number} totalDeductions - Total deductions
 * @returns {number} Net salary
 */
export function calculateNetSalary(grossSalary, totalDeductions) {
    return Math.max(0, Math.round(grossSalary - totalDeductions));
}

/**
 * Calculate all salary components automatically
 * @param {Object} salaryStructure - Employee salary structure
 * @param {Object} settings - Payroll settings
 * @param {number} lopDays - Loss of pay days (default 0)
 * @returns {Object} Complete salary calculation
 */
export function calculateCompleteSalary(
    salaryStructure,
    settings,
    lopDays = 0
) {
    // Calculate gross salary
    const grossSalary = calculateGrossSalary(salaryStructure);

    // Get PT slabs for employee's state
    const ptSlabs =
        settings.ptStates?.find((s) => s.state === salaryStructure.state)?.slabs ||
        DEFAULT_PT_SLABS[salaryStructure.state] ||
        [];

    // Calculate statutory deductions
    const pf = salaryStructure.pfApplicable
        ? calculatePF(
            salaryStructure.basic,
            settings.pfRate,
            settings.pfBasicThreshold
        )
        : 0;

    const esi = salaryStructure.esiApplicable
        ? calculateESI(
            grossSalary,
            settings.esiEmployeeRate,
            settings.esiGrossThreshold
        )
        : 0;

    const pt = calculatePT(grossSalary, ptSlabs);

    // Calculate annual income for TDS
    const annualGross = grossSalary * 12;
    const annualTDS =
        salaryStructure.taxRegime === "old"
            ? calculateTDS_OldRegime(annualGross, settings.standardDeduction)
            : calculateTDS_NewRegime(annualGross);
    const tds = getMonthlyTDS(annualTDS);

    // Calculate LOP
    const totalDays = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
    ).getDate();
    const lop = calculateLOP(grossSalary, totalDays, lopDays);

    // Manual deductions
    const loan = salaryStructure.loanDeduction || 0;
    const advance = salaryStructure.advanceDeduction || 0;

    // Total deductions
    const totalDeductions = calculateTotalDeductions({
        pf,
        esi,
        pt,
        tds,
        lop,
        loan,
        advance,
        otherDeductions: salaryStructure.otherDeductions || [],
    });

    // Net salary
    const netSalary = calculateNetSalary(grossSalary, totalDeductions);

    return {
        gross: grossSalary,
        deductions: {
            pf,
            esi,
            pt,
            tds,
            lop,
            loan,
            advance,
            otherDeductions: salaryStructure.otherDeductions || [],
            total: totalDeductions,
        },
        netSalary,
        totalDays,
        paidDays: totalDays - lopDays,
        lopDays,
    };
}
