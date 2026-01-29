import Link from "next/link";
import { ArrowRight, FileText, Banknote, Briefcase, PenTool, PieChart, Users, CheckCircle } from "lucide-react";
import { auth } from "@/auth";
import Footer from "@/components/Footer";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-20 lg:py-24 flex flex-col items-center text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
          All-in-One Business Management Suite
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900">
          Manage Your Business <br className="hidden md:block" />
          <span className="text-blue-600">With Confidence</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
          From smart invoicing and payroll management to project tracking and official letterheads — everything you need in one place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20">
          <Link
            href={session ? "#apps" : "/login"}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {session ? "Explore Apps" : "Get Started"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>

          {!session && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 transition-all duration-200 bg-gray-50 rounded-full hover:bg-gray-100 border border-gray-200"
            >
              Log In
            </Link>
          )}
        </div>

        {/* Feature Modules Grid */}
        <div id="apps" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl text-left">

          {/* Module 1: Invoicing */}
          <Link href="/invoices" className="group">
            <div className="h-full p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 relative z-10">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-blue-600 transition-colors">Smart Invoicing</h3>
              <p className="text-gray-600 text-sm relative z-10">
                Create GST-compliant invoices, track payments, and manage your clients efficiently.
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
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-green-600 transition-colors">Payroll System</h3>
              <p className="text-gray-600 text-sm relative z-10">
                Manage employee salaries, generate automated payslips, and track attendance.
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
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-purple-600 transition-colors">Project Tracker</h3>
              <p className="text-gray-600 text-sm relative z-10">
                Monitor project progress, manage tasks, and keep track of daily logs and milestones.
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
              <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10 group-hover:text-orange-600 transition-colors">Letterhead Editor</h3>
              <p className="text-gray-600 text-sm relative z-10">
                Design, customize, and print official company letterheads instantly.
              </p>
            </div>
          </Link>

        </div>
      </main>

      <Footer />
    </div>
  );
}
