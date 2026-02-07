"use client";

import { useState } from "react";
import { Save, User, Lock, X, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/ModalContext";
import { useToast } from "@/contexts/ToastContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/schemas/profileSchema";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const { alert } = useModal();
  const { addToast } = useToast();
  const { loading, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      designation: user.designation || "",
      employeeId: user.employeeId || "",
      department: user.department || "",
      joiningDate: user.joiningDate
        ? new Date(user.joiningDate).toISOString().split("T")[0]
        : "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = async (data) => {
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

    const result = await updateProfile(payload);

    if (result.success) {
      addToast("Profile updated successfully", "success");
      // Reset password fields but keep other fields
      reset({
        ...data,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setIsEditing(false);
      router.refresh();
    } else {
      await alert({
        title: "Error",
        message: result.error || "Failed to update profile",
        variant: "danger",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold">
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

        <Button
          variant={isEditing ? "secondary" : "primary"}
          onClick={() => {
            if (isEditing) {
              reset();
            }
            setIsEditing(!isEditing);
          }}
          icon={isEditing ? X : Edit2}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          {...register("name")}
          disabled={!isEditing}
          error={errors.name?.message}
          icon={User}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Designation"
            {...register("designation")}
            disabled={!isEditing}
            error={errors.designation?.message}
            placeholder="e.g. Software Engineer"
          />

          <Input
            label="Employee Code"
            {...register("employeeId")}
            disabled={!isEditing}
            error={errors.employeeId?.message}
            placeholder="e.g. EMP001"
          />

          <Input
            label="Department"
            {...register("department")}
            disabled={!isEditing}
            error={errors.department?.message}
            placeholder="e.g. Engineering"
          />

          <Input
            label="Date of Joining"
            type="date"
            {...register("joiningDate")}
            disabled={!isEditing}
            error={errors.joiningDate?.message}
          />
        </div>

        {isEditing ? <div className="pt-6 border-t border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </h3>
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                {...register("currentPassword")}
                error={errors.currentPassword?.message}
                placeholder="Required to change password"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  {...register("newPassword")}
                  error={errors.newPassword?.message}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  {...register("confirmNewPassword")}
                  error={errors.confirmNewPassword?.message}
                />
              </div>
            </div>
          </div> : null}

        {isEditing ? <div className="pt-6 flex justify-end">
            <Button
              type="submit"
              isLoading={loading}
              disabled={!isDirty}
              icon={Save}
              className="px-8"
            >
              Save Changes
            </Button>
          </div> : null}
      </form>
    </div>
  );
}
