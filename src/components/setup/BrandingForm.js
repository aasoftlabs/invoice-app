import { useFormContext, useWatch } from "react-hook-form";
import { Upload, Palette } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Theme Color */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all duration-300">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
            <Palette className="w-4 h-4 text-blue-500" />
            Theme Accent Color
          </label>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="color"
                {...register("formatting.color")}
                className="h-14 w-14 rounded-full p-1 border-2 cursor-pointer bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-md group-hover:scale-105"
              />
            </div>
            <div>
              <span className="text-lg font-mono font-bold text-gray-800 dark:text-slate-200 block uppercase">
                {color}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                Primary Brand Color
              </span>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
            Company Logo
          </label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 text-white transition-all transform active:scale-95">
                <Upload className="w-4 h-4" /> Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {logo && (
                <button
                  type="button"
                  onClick={() => setValue("logo", "")}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            {logo ? (
              <div className="mt-2 p-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-900 flex justify-center items-center">
                <Image
                  src={logo}
                  alt="Preview"
                  width={150}
                  height={60}
                  unoptimized
                  className="max-h-16 w-auto object-contain drop-shadow-sm"
                />
              </div>
            ) : (
              <div className="mt-2 h-24 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-slate-600 text-sm italic">
                No logo uploaded
              </div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-4 leading-relaxed bg-gray-50 dark:bg-slate-800/50 p-2 rounded">
            💡 For best results, use a high-resolution PNG with a transparent
            background.
          </p>
        </div>
      </div>
    </div>
  );
}
