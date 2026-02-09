import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/sendEmail";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we have sent a password reset link.",
        },
        { status: 200 },
      );
    }

    // Rate limiting: Check if last request was less than 1 minute ago
    if (user.lastResetRequest) {
      const lastReset = new Date(user.lastResetRequest).getTime();
      const timeSinceLastRequest = Date.now() - lastReset;
      const waitTime = 60000; // 1 minute in milliseconds



      if (timeSinceLastRequest < waitTime) {
        const remainingTime = Math.ceil(
          (waitTime - timeSinceLastRequest) / 1000,
        ); // Remaining seconds
        return NextResponse.json(
          {
            message: `Please wait ${remainingTime} seconds before requesting another password reset.`,
            remainingTime: remainingTime,
          },
          { status: 429 },
        );
      }
    } else {

    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    // Token expires in 30 minutes
    const resetTokenExpiry = Date.now() + 1800000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    user.lastResetRequest = new Date();
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we have sent a password reset link.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 },
    );
  }
}
