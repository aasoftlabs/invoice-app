import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import PayrollSettings from "@/models/PayrollSettings";
import { DEFAULT_PT_SLABS } from "@/lib/payrollCalculations";

// GET: Get payroll settings
export async function GET(req) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        let settings = await PayrollSettings.findOne({ companyId: "default" });

        if (!settings) {
            // Create default settings with common state PT slabs
            const ptStates = Object.keys(DEFAULT_PT_SLABS).map((state) => ({
                state,
                slabs: DEFAULT_PT_SLABS[state],
            }));

            settings = await PayrollSettings.create({
                companyId: "default",
                ptStates,
            });
        }

        return NextResponse.json({ settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// PUT: Update payroll settings (Admin or payroll permission only)
export async function PUT(req) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // Only users with payroll permission or admin can update
        const canUpdate =
            session.user.role === "admin" ||
            session.user.permissions?.includes("payroll");

        if (!canUpdate) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updates = await req.json();

        let settings = await PayrollSettings.findOne({ companyId: "default" });

        if (!settings) {
            settings = await PayrollSettings.create({
                companyId: "default",
                ...updates,
            });
        } else {
            Object.assign(settings, updates);
            await settings.save();
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
