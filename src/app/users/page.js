import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import UserManagement from "./UserManagement";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  await connectDB();

  // Fetch users
  const users = await User.find({}).sort({ createdAt: -1 }).lean();

  const serializedUsers = JSON.parse(JSON.stringify(users));

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-8">
        <UserManagement users={serializedUsers} />
      </div>
    </div>
  );
}
