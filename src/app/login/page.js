"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { authenticate } from "@/lib/actions";
import { FileText, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/loginSchema";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined,
  );

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur" // Validate on blur for immediate feedback
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <div className="flex items-center justify-center mb-6 gap-2">
          <Logo/>
        </div>
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">
          Welcome Back
        </h2>

        {/* We keep the form action={dispatch} for the server action connection 
            but rely on browser/hook-form to prevent submit if invalid 
            Note: react-hook-form's handleSubmit isn't strictly needed if we just want inline error messages
            but "best practice" suggests validating before network request.
            Since useActionState expects formData, we can just use the action directly 
            and let react-hook-form handle the UI errors via 'register'.
            HTML5 'required' attribute is also removed to let Zod handle it if we want custom messages.
         */}
        <form action={dispatch}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
              id="email"
              type="text"
              placeholder="admin@aasoftlabs.com"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline pr-10 ${errors.password ? 'border-red-500' : ''}`}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="admin123"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 -mt-2">{errors.password.message}</p>}
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
