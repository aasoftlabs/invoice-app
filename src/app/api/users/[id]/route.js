import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { auth } from "@/auth";

// GET: Get single user by ID (Admin or self)
export async function GET(req, { params }) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    // Allow users to fetch their own data or admins to fetch any user
    if (session.user.id !== id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(id).select("-password").lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PUT: Update user
export async function PUT(req, { params }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const reqJson = await req.json();
    const { name, designation, email, role, permissions } = reqJson;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 },
        );
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (designation !== undefined) updateData.designation = designation;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (typeof reqJson.enableEmail !== "undefined")
      updateData.enableEmail = reqJson.enableEmail;
    if (typeof reqJson.enablePayroll !== "undefined")
      updateData.enablePayroll = reqJson.enablePayroll;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE: Delete user
export async function DELETE(req, { params }) {
  const session = await auth();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
