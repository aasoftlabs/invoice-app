import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SlipView from "./SlipView";

export default async function SlipPage({ params }) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    const { slipId } = await params;

    return <SlipView slipId={slipId} />;
}
