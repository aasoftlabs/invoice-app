import { useFormContext, useWatch } from "react-hook-form";
import { Upload } from "lucide-react";
import Image from "next/image";
export default function BrandingForm() {
  const { register, setValue } = useFormContext();
  const color = useWatch({ name: "formatting.color" });
  const logo = useWatch({ name: "logo" });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue("logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
        Branding
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Theme Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              {...register("formatting.color")}
              className="h-10 w-20 rounded p-1 border cursor-pointer bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {color}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Company Logo
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm text-gray-700 dark:text-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-500">
              <Upload className="w-4 h-4" /> Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {logo && (
              <Image
                src={logo}
                alt="Preview"
                width={100}
                height={48}
                unoptimized
                className="h-12 w-auto object-contain border border-gray-200 dark:border-slate-700 p-1 rounded bg-white dark:bg-slate-900"
              />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Recommended: PNG with transparent background
          </p>
        </div>
      </div>
    </div>
  );
}
