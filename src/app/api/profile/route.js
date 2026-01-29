import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

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

export async function PUT(req) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const data = await req.json();
    const userId = session.user.id;

    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update fields
    if (data.name) user.name = data.name;

    // Password update
    if (data.password && data.newPassword) {
      const match = await bcrypt.compare(data.password, user.password);
      if (!match) {
        return NextResponse.json(
          { error: "Current password incorrect" },
          { status: 400 },
        );
      }
      user.password = await bcrypt.hash(data.newPassword, 10);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
