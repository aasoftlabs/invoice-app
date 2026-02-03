import Link from "next/link";
import { Plus, FileText, Settings, ArrowRight } from "lucide-react";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import InvoiceDashboard from "@/components/invoices/InvoiceDashboard";

export default async function Dashboard() {
  await connectDB();

  // 1. Check if ANY users exist (First Run Check)
  // We do this BEFORE auth check because if no users exist, no one can login.
  // Using .estimatedDocumentCount() is faster but .countDocuments() is safer for small sets.
  const userCount = await Invoice.db.collection("users").countDocuments();
  if (userCount === 0) {
    redirect("/setup");
  }

  // 2. Now check authentication
  const session = await auth();
  if (!session) redirect("/login");

  // 3. Check permissions
  if (
    session.user.role !== "admin" &&
    !session.user.permissions?.includes("invoices")
  ) {
    redirect("/"); // Redirect to home if no access
  }

  // 3. Parallel fetch for performance using .lean()
  // Synchronize initial load with current month/year to prevent flicker
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startDate = new Date(currentYear, currentMonth, 1);
  const endDate = new Date(currentYear, currentMonth + 1, 1);

  const [profile, invoices] = await Promise.all([
    CompanyProfile.findOne({}).lean(),
    Invoice.find({
      date: { $gte: startDate, $lt: endDate },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean(),
  ]);

  // Check if profile exists, if not redirect to setup
  if (!profile) redirect("/setup");

  // Serialize for Client Components
  const serializedInvoices = JSON.parse(JSON.stringify(invoices));

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-slate-200">
      <InvoiceDashboard initialInvoices={serializedInvoices} />
    </div>
  );
}
