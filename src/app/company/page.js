import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import CompanyProfile from "@/models/CompanyProfile";
import CompanyForm from "./CompanyForm";

export default async function CompanyPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // Check permissions - only admin or users with "company" permission
  if (
    session.user.role !== "admin" &&
    !session.user.permissions?.includes("company")
  ) {
    redirect("/");
  }

  await connectDB();
  const profile = await CompanyProfile.findOne({}).lean();

  const serializedProfile = profile
    ? JSON.parse(JSON.stringify(profile))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Company Settings
        </h1>
        <CompanyForm profile={serializedProfile} />
      </div>
    </div>
  );
}
