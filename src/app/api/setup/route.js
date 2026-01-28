import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import CompanyProfile from "@/models/CompanyProfile";
import User from "@/models/User";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();
  // Check if ANY user exists (to determine if setup is needed for admin)
  const userCount = await User.countDocuments();
  const profile = await CompanyProfile.findOne({});

  return NextResponse.json({ profile, userCount });
}

export async function POST(req) {
  try {
    await connectDB();
    const data = await req.json();

    // Check if we need to create an Admin user (First run)
    const { adminUser, ...profileData } = data;

    // If adminUser data is present, create the user
    if (adminUser) {
      // Validate no users exist to prevent overtaking
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);
        await User.create({
          name: adminUser.name,
          email: adminUser.email,
          password: hashedPassword,
          role: "admin",
          avatar: "", // could be added too
        });
      }
    } else {
      // Regular update, check auth
      const session = await auth();
      if (!session) {
        // Allow if it's strictly the first setup?
        // But normally if adminUser is missing, it implies we are editing profile while logged in.
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Handle Profile
    let profile = await CompanyProfile.findOne({});
    if (profile) {
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = await CompanyProfile.create(profileData);
    }

    return NextResponse.json({ success: true, profile }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
