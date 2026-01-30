import Link from "next/link";
import {
  FileText,
  Banknote,
  Briefcase,
  PenTool,
} from "lucide-react";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Project from "@/models/Project";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  // Fetch counts dynamically
  const [activeProjectsCount, pendingInvoicesCount, teamMembersCount] = await Promise.all([
    Project.countDocuments({ status: { $ne: "Completed" } }),
    Invoice.countDocuments({ status: { $in: ["Pending", "Partial", "Overdue"] } }),
    User.countDocuments(),
  ]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-12 lg:py-12 flex flex-col items-center text-center">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-500 mt-2">Access your business tools</p>
        </div>

        {/* Company Info Section */}
        <div className="w-full max-w-7xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 shadow-sm text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to AA SoftLabs</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We are dedicated to delivering excellence in every project. As part of our team, you retain access to all the tools you need to manage invoices, payroll, and projects efficiently.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-white rounded-lg border border-blue-100 text-sm font-medium text-blue-700 shadow-sm">
                🚀 Q1 Goals: Enhance UX
              </div>
              <div className="px-4 py-2 bg-white rounded-lg border border-blue-100 text-sm font-medium text-blue-700 shadow-sm">
                Team Meeting: Friday 4 PM
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-left flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Active Projects</span>
                <span className="font-bold text-gray-900">{activeProjectsCount}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Pending Invoices</span>
                <span className="font-bold text-gray-900">{pendingInvoicesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Team Members</span>
                <span className="font-bold text-gray-900">{teamMembersCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Modules Grid */}
        <div
          id="apps"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl text-left"
        >
          {/* Module 1: Invoicing */}
          <Link href="/invoices" className="group">
            <div className="h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 relative z-10">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-blue-600 transition-colors">
                Smart Invoicing
              </h3>
              <p className="text-gray-600 text-sm relative z-10">
                Create GST-compliant invoices, track payments, and manage your
                clients efficiently.
              </p>
            </div>
          </Link>

          {/* Module 2: Payroll */}
          <Link href="/payroll" className="group">
            <div className="h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 relative z-10">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-green-600 transition-colors">
                Payroll System
              </h3>
              <p className="text-gray-600 text-sm relative z-10">
                Manage employee salaries, generate automated payslips, and track
                attendance.
              </p>
            </div>
          </Link>

          {/* Module 3: Project Tracker */}
          <Link href="/project" className="group">
            <div className="h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 relative z-10">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-purple-600 transition-colors">
                Project Tracker
              </h3>
              <p className="text-gray-600 text-sm relative z-10">
                Monitor project progress, manage tasks, and keep track of daily
                logs and milestones.
              </p>
            </div>
          </Link>

          {/* Module 4: Letterhead */}
          <Link href="/letterhead" className="group">
            <div className="h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4 relative z-10">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-orange-600 transition-colors">
                Letterhead Editor
              </h3>
              <p className="text-gray-600 text-sm relative z-10">
                Design, customize, and print official company letterheads
                instantly.
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
