import Link from "next/link";
import { Plus, FileText, Settings, ArrowRight } from "lucide-react";
import connectDB from "@/lib/mongoose";
import Invoice from "@/models/Invoice";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import DashboardStats from "@/components/DashboardStats";

export default async function Dashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  // Parallel fetch for performance using .lean()
  const [profile, invoices] = await Promise.all([
    CompanyProfile.findOne({}).lean(),
    Invoice.find({}).sort({ date: -1 }).lean(),
  ]);

  // Check if profile exists, if not redirect to setup
  if (!profile) redirect("/setup");

  // Serialize for Client Components
  const serializedProfile = JSON.parse(JSON.stringify(profile));
  const serializedInvoices = JSON.parse(JSON.stringify(invoices));
  const serializedUser = session.user; // Session user is already serializable

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navbar with User & Company Info */}
      <Navbar user={serializedUser} profile={serializedProfile} />

      <div className="max-w-6xl mx-auto p-8">
        {/* Dashboard Stats */}
        <DashboardStats invoices={serializedInvoices} />

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
            <p className="text-sm text-gray-500">Manage your billing history</p>
          </div>
          <Link
            href="/invoices/create"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md font-medium"
          >
            <Plus className="w-4 h-4" /> Create New Invoice
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Invoice No</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serializedInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500 bg-gray-50/50"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="w-10 h-10 text-gray-300" />
                      <p>No invoices generated yet.</p>
                      <Link
                        href="/invoices/create"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Create your first invoice
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                serializedInvoices.map((inv) => (
                  <tr
                    key={inv._id}
                    className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {inv.invoiceNo}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(inv.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-800">
                      <div className="font-medium text-sm">
                        {inv.client.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {inv.client.company}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-800">
                      ₹ {inv.totalAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/invoices/${inv._id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Preview <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
            Showing {serializedInvoices.length} records logic
          </div>
        </div>
      </div>
    </div>
  );
}
