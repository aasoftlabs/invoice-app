import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/Input";

export default function CompanyInfoForm() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();
  const billingName = useWatch({ name: "billingName" });
  const name = useWatch({ name: "name" });

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
        Company Basic Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Company Name"
          {...register("name")}
          error={errors.name?.message}
          placeholder="e.g. AA SoftLabs"
        />

        <Input
          label="Slogan / Tagline (Optional)"
          {...register("slogan")}
          placeholder="e.g. Next-Gen Web Engineering"
        />

        {/* Billing Name Logic */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 mb-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={Boolean(billingName)}
              onChange={(e) => {
                if (!e.target.checked) {
                  setValue("billingName", ""); // Clear
                } else {
                  setValue("billingName", name || "Billing Name"); // Init
                }
              }}
              className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
              Use a different name for Billing? (Bill From)
            </span>
          </label>
          {billingName !== undefined && billingName !== "" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-4">
              <Input
                label="Billing Name"
                {...register("billingName")}
                placeholder="Legal Entity Name for Billing"
                helperText="This name will appear in the 'Bill From' section instead of the Company Name."
              />
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <Input
            label="Extra Tagline (Optional)"
            {...register("tagline")}
            placeholder="e.g. Next-Gen Web & Mobile Engineering"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Address"
            textarea
            rows={3}
            {...register("address")}
            error={errors.address?.message}
            placeholder="Full Business Address"
          />
        </div>

        <Input
          label="Registration No"
          {...register("registrationNo")}
          placeholder="UDYAM-XX-XX..."
        />

        <Input
          label="Registration Type / Source"
          {...register("registrationType")}
          placeholder="e.g. UDYAM"
        />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
          Contact & Tax Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input label="Phone" {...register("phone")} placeholder="+91 ..." />

          <Input
            label="PAN Number"
            {...register("pan")}
            placeholder="ABCDE1234F"
          />

          <Input
            label="GSTIN"
            {...register("gstIn")}
            placeholder="27AAAAA0000A1Z5"
          />
        </div>
      </div>
    </div>
  );
}
