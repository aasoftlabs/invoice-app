import { auth } from "@/auth";
import { redirect } from "next/navigation";
import MySlips from "./MySlips";

export default async function MySlipsPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Salary Slips</h1>
                    <p className="text-gray-500 mt-1">View your salary history</p>
                </div>
                <MySlips userId={session.user.id} />
            </div>
        </div>
    );
}
