import { ShieldAlert, LogOut, Home } from "lucide-react";
import Link from "next/link";
import Button from "./Button";

export default function AccessDenied({
  title = "Access Denied",
  message = "You do not have permission to view this page. Please contact your administrator if you believe this is an error.",
  showHome = true,
  showLogout = false,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/30">
        <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h2>

      <p className="text-gray-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      <div className="flex gap-4">
        {showHome ? <Link href="/">
            <Button variant="outline" icon={Home}>
              Go Home
            </Button>
          </Link> : null}

        {showLogout ? <Link href="/api/auth/signout">
            <Button variant="ghost" icon={LogOut}>
              Log Out
            </Button>
          </Link> : null}
      </div>
    </div>
  );
}
