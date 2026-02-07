import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import InvoiceEditor from "@/components/InvoiceEditor";

export default async function EditInvoicePage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const { id } = await params;

  const invoice = await Invoice.findById(id).lean();
  if (!invoice) notFound();

  const serializedInvoice = {
    ...invoice,
    _id: invoice._id.toString(),
    date: invoice.date.toISOString(),
    // dueDate removed
    createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
    items: invoice.items.map((i) => ({
      ...i,
      _id: i._id ? i._id.toString() : undefined,
    })),
    // Flatten client details for consistency and preview rendering
    clientName: invoice.client?.name || "",
    clientCompany: invoice.client?.company || "",
    clientAddress: invoice.client?.address || "",
    clientGst: invoice.client?.gst || "",
    paymentHistory: (invoice.paymentHistory || []).map((p) => ({
      ...p,
      _id: p._id ? p._id.toString() : undefined,
      date: p.date ? new Date(p.date).toISOString() : null,
      transactionId: p.transactionId ? p.transactionId.toString() : undefined,
    })),
  };

  return <InvoiceEditor initialData={serializedInvoice} isEditing />;
}
