import connectDB from "@/lib/mongoose";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LetterheadView from "./LetterheadView";
import Navbar from "@/components/Navbar";

export default async function LetterheadPage() {
    await connectDB();
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const profile = await CompanyProfile.findOne({}).lean();

    // Serialize
    const serializedProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;
    const serializedUser = session.user;

    return (
        <>
            <div className="print:hidden">
                <Navbar user={serializedUser} profile={serializedProfile} />
            </div>
            <LetterheadView profile={serializedProfile} />
        </>
    );
}
