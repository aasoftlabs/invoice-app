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
    <div className="min-h-screen font-sans py-8">
      <div className="container mx-auto px-4 md:px-6">
        <UserManagement users={serializedUsers} />
      </div>
    </div>
  );
}
