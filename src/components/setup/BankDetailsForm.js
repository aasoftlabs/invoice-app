import { useFormContext } from "react-hook-form";

export default function BankDetailsForm() {
    const { register } = useFormContext();

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Bank Details (For Invoice)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                    </label>
                    <input
                        {...register("bankDetails.bankName")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Name
                    </label>
                    <input
                        {...register("bankDetails.accountName")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                    </label>
                    <input
                        {...register("bankDetails.accountNumber")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                    </label>
                    <input
                        {...register("bankDetails.ifscCode")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                    </label>
                    <input
                        {...register("bankDetails.branch")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
