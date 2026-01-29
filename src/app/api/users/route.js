import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

// GET: List all users (Admin only)
export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const users = await User.find({}).select("-password").sort({ createdAt: -1 });
  return NextResponse.json(users);
}

// POST: Create new user (Admin only)
export async function POST(req) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const data = await req.json();

    // Check duplication
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Set permissions - admin gets all, regular user gets provided permissions
    const userPermissions = data.role === "admin"
      ? ["invoices", "letterhead", "project", "users", "profile"]
      : (data.permissions || ["invoices", "letterhead", "project", "profile"]);

    const newUser = await User.create({
      name: data.name,
      designation: data.designation || "",
      email: data.email,
      password: hashedPassword,
      role: data.role || "user",
      permissions: userPermissions,
      avatar: data.avatar || "",
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
