import { forwardRef } from "react";
import BrandName from "@/components/BrandName";
import Image from "next/image";

const SlipTemplate = forwardRef(({ slip, company }, ref) => {
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB");
    };

    const formatCurrency = (amount) => {
        return amount?.toLocaleString("en-IN") || "0";
    };

    const renderRow = (label, amount) => {
        if (amount === undefined || amount === null || amount === 0) return null;
        return (
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="p-2 pl-4 text-gray-700">{label}</td>
                <td className="p-2 pr-4 text-right font-medium text-gray-900">
                    ₹{amount.toLocaleString("en-IN")}
                </td>
            </tr>
        );
    };

    const toWords = (num) => {
        if (!num) return "Zero";
        const a = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];
        const b = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];

        if ((num = num.toString()).length > 9) return "overflow";
        const n = ("000000000" + num)
            .substr(-9)
            .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return;
        let str = "";
        str +=
            n[1] != 0
                ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
                : "";
        str +=
            n[2] != 0
                ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
                : "";
        str +=
            n[3] != 0
                ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
                : "";
        str +=
            n[4] != 0
                ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred "
                : "";
        str +=
            n[5] != 0
                ? (str != "" ? "and " : "") +
                (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]])
                : "";
        return str.trim();
    };

    return (
        <div
            ref={ref}
            className="max-w-[210mm] min-h-[297mm] print:min-h-0 print:h-auto mx-auto bg-white shadow-lg print:shadow-none p-12 print:px-8 print:py-2 text-sm flex flex-col"
        >
            {/* Header - Logo/Name left, Address right, inline */}
            <div className="flex justify-between items-start pb-6 mb-8 border-b-2 border-gray-200">
                {/* Left side - Logo and Company Name */}
                <div className="flex items-center gap-3">
                    {company?.logo ? (
                        <Image
                            src={company.logo}
                            alt="Logo"
                            width={100}
                            height={64}
                            unoptimized
                            className="h-16 w-auto object-contain"
                        />
                    ) : (
                        <div className="h-16 w-16 bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-2xl">
                            {company?.name?.[0] || "C"}
                        </div>
                    )}
                    <div className="leading-tight text-left">
                        <BrandName
                            name={company?.name}
                            color={company?.formatting?.color}
                        />
                        {company?.slogan ? <p className="text-[9px] text-gray-500 uppercase mt-0.5 font-medium tracking-wider">
                                {company.slogan}
                            </p> : null}
                        {company?.tagline ? <p
                                className="text-[10px] font-bold uppercase mt-0.5"
                                style={{ color: company?.formatting?.color || "#1d4ed8" }}
                            >
                                {company.tagline}
                            </p> : null}
                    </div>
                </div>

                {/* Right side - Address */}
                <div className="text-right max-w-[250px]">
                    <p className="text-gray-500 text-[10px] whitespace-pre-line">
                        <span className="font-semibold text-gray-600">Reg. Office:</span>{" "}
                        {company?.address ||
                            "Company Address, City, State, Zip Code\nContact: contact@company.com"}
                    </p>
                </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold text-blue-800 mb-8 uppercase text-center">
                Payslip for {monthNames[slip.month - 1]} {slip.year}
            </h2>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
                <div className="space-y-3">
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Employee Name:</span>
                        <span className="font-semibold text-gray-900">
                            {slip.userId.name}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Employee ID:</span>
                        <span className="font-semibold text-gray-900">
                            {slip.userId.employeeId ||
                                slip.userId._id.slice(-6).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Designation:</span>
                        <span className="font-semibold text-gray-900">
                            {slip.userId.designation || "N/A"}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Department:</span>
                        <span className="font-semibold text-gray-900">General</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Payslip No:</span>
                        <span className="font-semibold text-gray-900">
                            {slip.userId.employeeId
                                ? `${slip.userId.employeeId}-${slip.month}${slip.year}`
                                : `${slip._id.slice(-6).toUpperCase()}`}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Date of Joining:</span>
                        <span className="font-semibold text-gray-900">
                            {formatDate(slip.userId.joiningDate)}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Effective Work Days:</span>
                        <span className="font-semibold text-gray-900">
                            {slip.presentDays}
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                        <span className="text-gray-500">Loss of Pay (Days):</span>
                        <span
                            className={`font-semibold ${slip.lopDays > 0 ? "text-red-600" : "text-gray-900"}`}
                        >
                            {slip.lopDays}
                        </span>
                    </div>
                </div>
            </div>

            {/* Salary Table */}
            <div className="border border-gray-300 rounded overflow-hidden mb-8">
                <div className="grid grid-cols-2 bg-gray-50 border-b border-gray-300 font-bold text-gray-700 uppercase text-xs tracking-wider">
                    <div className="p-3 text-center border-r border-gray-300">
                        Earnings
                    </div>
                    <div className="p-3 text-center">Deductions</div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-300">
                    {/* Earnings Column */}
                    <div className="p-0 flex flex-col">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-2 pl-4 text-xs text-gray-500 font-medium">
                                        Component
                                    </th>
                                    <th className="text-right p-2 pr-4 text-xs text-gray-500 font-medium">
                                        Amount (₹)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {renderRow("Basic Salary", slip.earnings.basic)}
                                {renderRow("Dearness Allowance", slip.earnings.da)}
                                {renderRow("HRA", slip.earnings.hra)}
                                {renderRow("Conveyance", slip.earnings.conveyanceAllowance)}
                                {renderRow("Special Allowance", slip.earnings.specialAllowance)}
                                {renderRow("Medical Allowance", slip.earnings.medicalAllowance)}
                                {renderRow("Mobile Expense", slip.earnings.mobileExpense)}
                                {renderRow(
                                    "Distance Allowance",
                                    slip.earnings.distanceAllowance,
                                )}
                                {renderRow("Bonus", slip.earnings.bonus)}
                                {renderRow("Arrears", slip.earnings.arrears)}
                                {slip.earnings.otherAllowances?.map((allowance) =>
                                    renderRow(allowance.name, allowance.amount),
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Deductions Column */}
                    <div className="p-0 flex flex-col">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-2 pl-4 text-xs text-gray-500 font-medium">
                                        Component
                                    </th>
                                    <th className="text-right p-2 pr-4 text-xs text-gray-500 font-medium">
                                        Amount (₹)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {renderRow("Provident Fund (PF)", slip.deductions.pf)}
                                {renderRow("ESI", slip.deductions.esi)}
                                {renderRow("Professional Tax", slip.deductions.pt)}
                                {renderRow("TDS", slip.deductions.tds)}
                                {renderRow("Loan Repayment", slip.deductions.loan)}
                                {renderRow("Advance Adjustment", slip.deductions.advance)}
                                {renderRow("Loss of Pay (LOP)", slip.deductions.lop)}
                                {slip.deductions.otherDeductions?.map((deduction) =>
                                    renderRow(deduction.name, deduction.amount),
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="grid grid-cols-2 border-t border-gray-300 bg-gray-50 font-bold border-b text-gray-900">
                    <div className="p-3 pl-4 pr-4 flex justify-between border-r border-gray-300">
                        <span>Total Earnings</span>
                        <span>₹{formatCurrency(slip.earnings.gross)}</span>
                    </div>
                    <div className="p-3 pl-4 pr-4 flex justify-between">
                        <span>Total Deductions</span>
                        <span className="text-red-600">
                            ₹{formatCurrency(slip.deductions.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Net Pay */}
            <div className="flex justify-end mb-8">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg w-1/2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-blue-800 uppercase">
                            Net Payable
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                            ₹{formatCurrency(slip.netPay)}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 italic font-medium tracking-wide">
                            In Words: {toWords(slip.netPay)} Only
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-gray-200">
                <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest">
                    This is a Computer Generated Document - No Signature Required
                </p>

            </div>
        </div>
    );
});

SlipTemplate.displayName = "SlipTemplate";

export default SlipTemplate;
