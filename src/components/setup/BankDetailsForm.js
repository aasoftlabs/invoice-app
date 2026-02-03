import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/Input";

export default function BankDetailsForm() {
  const { register } = useFormContext();

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
        Bank Details (For Invoice)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 dark:bg-slate-900/40 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
        <Input
          label="Bank Name"
          {...register("bankDetails.bankName")}
          placeholder="e.g. HDFC Bank"
        />

        <Input
          label="Account Name"
          {...register("bankDetails.accountName")}
          placeholder="e.g. AA SoftLabs Pvt Ltd"
        />

        <Input
          label="Account Number"
          {...register("bankDetails.accountNumber")}
          placeholder="000000000000"
        />

        <Input
          label="IFSC Code"
          {...register("bankDetails.ifscCode")}
          placeholder="HDFC0000..."
        />

        <div className="md:col-span-2">
          <Input
            label="Branch"
            {...register("bankDetails.branch")}
            placeholder="e.g. Downtown Branch"
          />
        </div>
      </div>
    </div>
  );
}
