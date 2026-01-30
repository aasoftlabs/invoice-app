import { User } from "lucide-react";
import { useFormContext } from "react-hook-form";

export default function SetupAdminForm() {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Admin Account Setup
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                    </label>
                    <input
                        {...register("adminUser.name")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
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
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                        placeholder="admin@company.com"
                    />
                    {errors.adminUser?.email && <p className="text-xs text-red-500">{errors.adminUser.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        {...register("adminUser.password")}
                        type="password"
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                        placeholder="******"
                    />
                    {errors.adminUser?.password && <p className="text-xs text-red-500">{errors.adminUser.password.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <input
                        {...register("adminUser.confirmPassword")}
                        type="password"
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                        placeholder="******"
                    />
                    {errors.adminUser?.confirmPassword && <p className="text-xs text-red-500">{errors.adminUser.confirmPassword.message}</p>}
                </div>
            </div>
        </div>
    );
}
