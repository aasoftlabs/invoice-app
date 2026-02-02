"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, User, Lock, X, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/schemas/profileSchema";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const { alert } = useModal();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      designation: user.designation || "",
      employeeId: user.employeeId || "",
      department: user.department || "",
      joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : "",
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
        designation: data.designation,
        employeeId: data.employeeId,
        department: data.department,
        joiningDate: data.joiningDate,
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
        await alert({
          title: "Success",
          message: "Profile updated successfully",
          variant: "success",
        });
        // Reset password fields but keep other fields
        reset({
          name: data.name,
          designation: data.designation,
          employeeId: data.employeeId,
          department: data.department,
          joiningDate: data.joiningDate,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setIsEditing(false);
        router.refresh();
      } else {
        const err = await res.json();
        await alert({
          title: "Error",
          message: "Error: " + err.error,
          variant: "danger",
        });
      }
    } catch (e) {
      console.error(e);
      await alert({
        title: "Error",
        message: "Failed to update profile",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
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
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              reset({
                name: user.name || "",
                designation: user.designation || "",
                employeeId: user.employeeId || "",
                department: user.department || "",
                joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : "",
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
              });
            }
            setIsEditing(!isEditing);
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${isEditing
            ? "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600"
            : "bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600"
            }`}
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" /> Edit Profile
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            <User className="inline w-4 h-4 mr-1" /> Full Name
          </label>
          <input
            {...register("name")}
            disabled={!isEditing}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white ${isEditing
              ? "bg-white dark:bg-slate-700"
              : "bg-gray-50 dark:bg-slate-800 cursor-not-allowed"
              } dark:border-slate-600 ${errors.name
                ? "border-red-500"
                : "border-gray-300 dark:border-slate-600"
              }`}
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Designation Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Designation
          </label>
          {!isEditing && !watch("designation") ? (
            <div className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed">
              Not Set
            </div>
          ) : (
            <input
              {...register("designation")}
              disabled={!isEditing}
              placeholder={isEditing ? "e.g., Software Engineer, Manager" : ""}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white ${isEditing
                ? "bg-white dark:bg-slate-700"
                : "bg-gray-50 dark:bg-slate-800 cursor-not-allowed"
                } dark:border-slate-600 ${errors.designation
                  ? "border-red-500"
                  : "border-gray-300 dark:border-slate-600"
                }`}
            />
          )}
          {errors.designation && (
            <p className="text-xs text-red-500 mt-1">{errors.designation.message}</p>
          )}
        </div>

        {/* Employee Code Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Employee Code
          </label>
          {!isEditing && !watch("employeeId") ? (
            <div className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed">
              Not Set
            </div>
          ) : (
            <input
              {...register("employeeId")}
              disabled={!isEditing}
              placeholder={isEditing ? "e.g., EMP001" : ""}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white ${isEditing
                ? "bg-white dark:bg-slate-700"
                : "bg-gray-50 dark:bg-slate-800 cursor-not-allowed"
                } dark:border-slate-600 ${errors.employeeId
                  ? "border-red-500"
                  : "border-gray-300 dark:border-slate-600"
                }`}
            />
          )}
          {errors.employeeId && (
            <p className="text-xs text-red-500 mt-1">{errors.employeeId.message}</p>
          )}
        </div>

        {/* Department Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Department
          </label>
          {!isEditing && !watch("department") ? (
            <div className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed">
              Not Set
            </div>
          ) : (
            <input
              {...register("department")}
              disabled={!isEditing}
              placeholder={isEditing ? "e.g., Engineering, Sales" : ""}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white ${isEditing
                ? "bg-white dark:bg-slate-700"
                : "bg-gray-50 dark:bg-slate-800 cursor-not-allowed"
                } dark:border-slate-600 ${errors.department
                  ? "border-red-500"
                  : "border-gray-300 dark:border-slate-600"
                }`}
            />
          )}
          {errors.department && (
            <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>
          )}
        </div>

        {/* Date of Joining Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Date of Joining
          </label>
          {!isEditing && !watch("joiningDate") ? (
            <div className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed">
              Not Set
            </div>
          ) : (
            <input
              type="date"
              {...register("joiningDate")}
              disabled={!isEditing}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white ${isEditing
                ? "bg-white dark:bg-slate-700"
                : "bg-gray-50 dark:bg-slate-800 cursor-not-allowed"
                } dark:border-slate-600 ${errors.joiningDate
                  ? "border-red-500"
                  : "border-gray-300 dark:border-slate-600"
                }`}
            />
          )}
          {errors.joiningDate && (
            <p className="text-xs text-red-500 mt-1">{errors.joiningDate.message}</p>
          )}
        </div>

        {/* Change Password Section */}
        {isEditing && (
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
                  className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 dark:border-slate-600 ${errors.currentPassword
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
                    className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 dark:border-slate-600 ${errors.newPassword
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
                    className={`w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white bg-white dark:bg-slate-700 ${errors.confirmNewPassword
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
        )}

        {/* Submit Button */}
        {isEditing && (
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
        )}
      </form>
    </div>
  );
}
