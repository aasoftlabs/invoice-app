import { notFound } from "next/navigation";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import VerificationForm from "@/components/VerificationForm";

export default async function VerifyInvoice({ params }) {
    await connectDB();
    const { id } = await params;

    // We only check if ID is valid format or exists briefly, 
    // but logic is moved to component + server action for security.
    // Actually, to render the component we just need the ID.
    // We can do a quick check if it exists to avoid showing form for random IDs.

    let invoiceExists = false;
    try {
        const count = await Invoice.countDocuments({ _id: id });
        invoiceExists = count > 0;
    } catch (e) {
        return notFound();
    }

    if (!invoiceExists) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <VerificationForm invoiceId={id} />
        </div>
    );
}
