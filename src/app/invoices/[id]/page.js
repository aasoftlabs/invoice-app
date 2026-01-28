import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import { toWords } from "number-to-words";

// Helper for number to words since we are server side here or can use client comp
// But let's just use the same logic or pass to a client comp.
// Actually, for printing, client side is better for 'window.print()'.
// So I will make this a Server Component that fetches data, then passes to a Client Component wrapper for printing.

import InvoiceViewer from "./InvoiceViewer"; // We'll make this

export default async function InvoicePage({ params }) {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const { id } = await params;

  // Parallel data fetching
  const [invoice, profile] = await Promise.all([
    Invoice.findById(id).lean(),
    CompanyProfile.findOne({}).lean(),
  ]);

  if (!invoice) notFound();

  // Mongoose .lean() returns plain objects, but _id and date might still need string conversion
  // dependent on what the Client Component expects.
  // InvoiceViewer expects plain objects.
  // Next.js serializes Date objects automatically to ISO strings in Server Components -> Client Components props?
  // Actually Next.js warns about Date objects and MongoDB ObjectIds in props.
  // We need to conform them.

  const serialize = (obj) => {
    if (!obj) return null;
    return JSON.parse(JSON.stringify(obj));
  };

  // Actually, standardizing strictly:
  // Convert _id to string manually if needed, but JSON.stringify is still the safest "catch-all"
  // for dates/objectIds if we don't want to map every field manually.
  // BUT the rule says avoid it if possible.
  // With .lean(), it's lighter.
  // Let's rely on a helper or just do it clean.

  // For this exercise, I will use the serialize helper but applied to the lean result,
  // which is already much better than hydrating the full Mongoose document then stringifying.
  // Ideally, we map specific fields:

  const serializedInvoice = {
    ...invoice,
    _id: invoice._id.toString(),
    date: invoice.date.toISOString(), // ensure string
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    createdAt: invoice.createdAt ? invoice.createdAt.toISOString() : null,
    items: invoice.items.map((i) => ({
      ...i,
      _id: i._id ? i._id.toString() : undefined,
    })),
    // Mongoose subdocs might have _ids
  };

  const serializedProfile = profile
    ? {
      ...profile,
      _id: profile._id.toString(),
      updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : null,
    }
    : null;

  return (
    <InvoiceViewer invoice={serializedInvoice} profile={serializedProfile} />
  );
}
