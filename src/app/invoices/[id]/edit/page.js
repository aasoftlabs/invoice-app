import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import InvoiceEditor from "@/components/InvoiceEditor";

export default async function EditInvoicePage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const { id } = params;

  const invoice = await Invoice.findById(id).lean();
  if (!invoice) notFound();

  const serializedInvoice = {
    ...invoice,
    _id: invoice._id.toString(),
    date: invoice.date.toISOString(),
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
    items: invoice.items.map((i) => ({
      ...i,
      _id: i._id ? i._id.toString() : undefined,
    })),
  };

  return <InvoiceEditor initialData={serializedInvoice} isEditing={true} />;
}
