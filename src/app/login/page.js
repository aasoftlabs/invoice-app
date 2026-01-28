"use client";

import { useFormStatus, useFormState } from "react-dom";
import { authenticate } from "@/lib/actions";
import { FileText } from "lucide-react";

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <div className="flex items-center justify-center mb-6 gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Invoice App</h1>
        </div>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
          Login
        </h2>
        <form action={dispatch}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              placeholder="admin@aasoftlabs.com"
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              name="password"
              placeholder="admin123"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <LoginButton />
          </div>
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        </form>
        <div className="mt-4 text-center text-xs text-gray-500">
          Demo: admin@aasoftlabs.com / admin123
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors disabled:opacity-50"
      aria-disabled={pending}
    >
      {pending ? "Logging in..." : "Sign In"}
    </button>
  );
}
