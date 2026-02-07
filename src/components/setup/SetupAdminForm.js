import { User } from "lucide-react";
import { useFormContext } from "react-hook-form";

export default function SetupAdminForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
      <h2 className="text-lg font-bold text-blue-800 dark:text-blue-400 mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Admin
        Account Setup
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            {...register("adminUser.name")}
            className="w-full p-2.5 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Admin Name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Login)
          </label>
          <input
            {...register("adminUser.email")}
            type="email"
            className="w-full p-2.5 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="admin@company.com"
          />
          {errors.adminUser?.email ? <p className="text-xs text-red-500">
              {errors.adminUser.email.message}
            </p> : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            {...register("adminUser.password")}
            type="password"
            className="w-full p-2.5 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="******"
          />
          {errors.adminUser?.password ? <p className="text-xs text-red-500">
              {errors.adminUser.password.message}
            </p> : null}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            {...register("adminUser.confirmPassword")}
            type="password"
            className="w-full p-2.5 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="******"
          />
          {errors.adminUser?.confirmPassword ? <p className="text-xs text-red-500">
              {errors.adminUser.confirmPassword.message}
            </p> : null}
        </div>
      </div>
    </div>
  );
}
