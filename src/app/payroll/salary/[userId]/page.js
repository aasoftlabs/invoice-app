import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SalaryStructureForm from "./SalaryStructureForm";

export default async function SalaryStructurePage({ params }) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const { userId } = await params;

    // Check permission: user editing own salary, or have payroll permission
    const canEdit =
        session.user.id === userId ||
        session.user.role === "admin" ||
        session.user.permissions?.includes("payroll");

    if (!canEdit) {
        redirect("/payroll/my-slips");
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-5xl mx-auto p-8">
                <SalaryStructureForm userId={userId} sessionUserId={session.user.id} />
            </div>
        </div>
    );
}
