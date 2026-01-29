import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PayrollSettingsPage from "./PayrollSettingsPage";

export default async function SettingsPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Only admin or payroll permission
    const canAccess =
        session.user.role === "admin" ||
        session.user.permissions?.includes("payroll");

    if (!canAccess) {
        redirect("/payroll/my-slips");
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans p-8">
            <PayrollSettingsPage />
        </div>
    );
}
