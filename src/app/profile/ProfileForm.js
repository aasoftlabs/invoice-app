"use client";

import { useState } from "react";
import { Save, Loader2, User, Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/schemas/profileSchema";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Prepare Payload
      const payload = {
        name: data.name,
        ...(data.newPassword
          ? {
              password: data.currentPassword,
              newPassword: data.newPassword,
            }
          : {}),
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Profile updated successfully");
        // Reset password fields but keep name
        reset({
          name: data.name,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        router.refresh();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
          {user.name?.[0]}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.name}
          </h2>
          <p className="text-gray-500 dark:text-slate-400">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs rounded uppercase font-semibold">
            {user.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            <User className="inline w-4 h-4 mr-1" /> Full Name
          </label>
          <input
            {...register("name")}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 dark:border-slate-600 ${
              errors.name
                ? "border-red-500"
                : "border-gray-300 dark:border-slate-600"
            }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Change Password Section */}
        <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </h3>
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                Current Password (Required to change)
              </label>
              <input
                type="password"
                {...register("currentPassword")}
                className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 dark:border-slate-600 ${
                  errors.currentPassword
                    ? "border-red-500"
                    : "border-gray-300 dark:border-slate-600"
                }`}
              />
              {errors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Passwords */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  {...register("newPassword")}
                  className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 dark:border-slate-600 ${
                    errors.newPassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-slate-600"
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  {...register("confirmNewPassword")}
                  className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 ${
                    errors.confirmNewPassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-slate-600"
                  }`}
                />
                {errors.confirmNewPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmNewPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading || !isDirty}
            className="bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
