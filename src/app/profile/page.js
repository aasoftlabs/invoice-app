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
    <div className="min-h-screen font-sans py-8">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 max-w-2xl mx-auto">
          My Profile
        </h1>
        <div className="max-w-2xl mx-auto">
          <ProfileForm user={serializedUser} />
        </div>
      </div>
    </div>
  );
}
