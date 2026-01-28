import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import Navbar from "@/components/Navbar";
import CompanyProfile from "@/models/CompanyProfile";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const [user, profile] = await Promise.all([
    User.findById(session.user.id).lean(),
    CompanyProfile.findOne({}).lean(),
  ]);

  if (!user) redirect("/login");

  const serializedUser = {
    ...session.user,
    name: user.name,
    email: user.email,
  };

  const serializedProfile = JSON.parse(JSON.stringify(profile));

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar user={serializedUser} profile={serializedProfile} />

      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
        <ProfileForm user={serializedUser} />
      </div>
    </div>
  );
}
