import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MySlips from "../my-slips/MySlips";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ViewEmployeeSlips({ searchParams }) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Check permission
    const canView =
        session.user.role === "admin" ||
        session.user.permissions?.includes("payroll");

    if (!canView) {
        redirect("/payroll");
    }

    const { userId } = await searchParams;

    if (!userId) {
        redirect("/payroll");
    }

    await connectDB();
    const user = await User.findById(userId).select("name email").lean();

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans p-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-800">User not found</h1>
                    <Link href="/payroll" className="text-blue-600 hover:underline mt-4 inline-block">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Link
                                href="/payroll"
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-800">Employee Salary Slips</h1>
                        </div>
                        <p className="text-gray-500 ml-9">Viewing records for <span className="font-semibold text-gray-700">{user.name}</span> ({user.email})</p>
                    </div>
                </div>
                <MySlips userId={userId} />
            </div>
        </div>
    );
}
