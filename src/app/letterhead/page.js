import connectDB from "@/lib/mongoose";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LetterheadView from "./LetterheadView";

export default async function LetterheadPage() {
    await connectDB();
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Check permissions
    if (session.user.role !== "admin" && !session.user.permissions?.includes("letterhead")) {
        redirect("/");
    }

    const profile = await CompanyProfile.findOne({}).lean();

    // Serialize
    const serializedProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;

    return (
        <LetterheadView profile={serializedProfile} />
    );
}
