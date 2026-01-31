import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Note from "@/models/Note";
import { auth } from "@/auth";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Auto-complete expired notes
    const now = new Date();
    await Note.updateMany(
      {
        status: "Pending",
        endDateTime: { $lt: now },
      },
      {
        $set: { status: "Completed" },
      },
    );

    // Fetch notes:
    // 1. All public notes
    // 2. Private notes created by the current user
    const notes = await Note.find({
      $or: [{ share: "public" }, { createdBy: session.user.id }],
    })
      .sort({ startDateTime: -1 })
      .populate("createdBy", "name");

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    const newNote = await Note.create({
      ...data,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true, data: newNote }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
