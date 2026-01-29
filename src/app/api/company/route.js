import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";

// GET: Get company profile
export async function GET() {
    try {
        await connectDB();
        const profile = await CompanyProfile.findOne({}).lean();

        return NextResponse.json({
            success: true,
            data: profile
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// POST/PUT: Update company profile
export async function POST(req) {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions
    if (session.user.role !== "admin" && !session.user.permissions?.includes("company")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        await connectDB();
        const data = await req.json();

        // Upsert company profile
        const profile = await CompanyProfile.findOneAndUpdate(
            {},
            data,
            { new: true, upsert: true, runValidators: true }
        ).lean();

        return NextResponse.json({ success: true, data: profile });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PUT(req) {
    return POST(req); // Reuse POST logic
}
