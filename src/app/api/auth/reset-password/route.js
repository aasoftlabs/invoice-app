import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
