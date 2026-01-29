import Link from "next/link";
import { ArrowRight, FileText, CheckCircle, Shield } from "lucide-react";
import connectDB from "@/lib/mongoose";
import CompanyProfile from "@/models/CompanyProfile";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";

export default async function LandingPage() {
  await connectDB();
  const session = await auth();

  // We try to fetch profile/user to pass to Navbar if logged in
  let profile = null;
  if (session) {
    profile = await CompanyProfile.findOne({}).lean();
  }

  // Serialize if exists
  const serializedProfile = profile ? JSON.parse(JSON.stringify(profile)) : null;
  const serializedUser = session?.user || null;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Navbar - Reuse existing one, works even if user not logged in (will just show brand if handled or we can adjust) 
          Actually, checking Navbar code: it expects `user` and `profile`. 
          If user is null, it shows "User" and "Admin" in menu? No, let's see. 
          It renders User menu if user prop is passed. 
          If serializedUser is null, Navbar might need slight tweak or we pass nulls. 
      */}
      <Navbar user={serializedUser} profile={serializedProfile} />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
          Simple & Professional Invoicing
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Streamline Your <br className="hidden md:block" />
          <span className="text-blue-600">Billing Process</span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
          Create, manage, and track invoices with ease. Designed for freelancers and small businesses to look professional and get paid faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href={session ? "/invoices" : "/login"}
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {session ? "Go to Dashboard" : "Get Started"}
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

        {/* Features / Visuals */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl text-left">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clean Invoices</h3>
            <p className="text-gray-600">Generate beautiful, professional PDF invoices that reflect your brand identity.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Track Status</h3>
            <p className="text-gray-600">Keep track of paid, pending, and overdue invoices in one simple dashboard.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Data</h3>
            <p className="text-gray-600">Your client and billing data is stored securely and accessible only by you.</p>
          </div>
        </div>

      </main>

      <footer className="py-8 border-t border-gray-100 mt-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Invoice App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
