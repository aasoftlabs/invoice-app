import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const user = await User.findById(session.user.id).lean();

  if (!user) redirect("/login");

  const serializedUser = {
    ...session.user,
    name: user.name,
    email: user.email,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          My Profile
        </h1>
        <ProfileForm user={serializedUser} />
      </div>
    </div>
  );
}
