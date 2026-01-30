import { useFormContext, useWatch } from "react-hook-form";

export default function CompanyInfoForm() {
    const { register, setValue, formState: { errors } } = useFormContext();
    const billingName = useWatch({ name: "billingName" });
    const name = useWatch({ name: "name" });

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Company Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                    </label>
                    <input
                        {...register("name")}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="e.g. AA SoftLabs"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slogan / Tagline (Optional)
                    </label>
                    <input
                        {...register("slogan")}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="e.g. Next-Gen Web Engineering"
                    />
                </div>

                {/* Billing Name Logic */}
                <div className="md:col-span-2">
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
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
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Use a different name for Billing? (Bill From)
                        </span>
                    </label>
                    {billingName && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Billing Name
                            </label>
                            <input
                                {...register("billingName")}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                placeholder="Legal Entity Name for Billing"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This name will appear in the "Bill From" section instead of the Company Name.
                            </p>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extra Tagline (Optional)
                    </label>
                    <input
                        {...register("tagline")}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="e.g. Next-Gen Web & Mobile Engineering"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <textarea
                        {...register("address")}
                        rows={3}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="Full Business Address"
                    />
                    {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration No
                    </label>
                    <input
                        {...register("registrationNo")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                        placeholder="UDYAM-XX-XX..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Type / Source
                    </label>
                    <input
                        {...register("registrationType")}
                        className="w-full p-2 border rounded text-gray-900 bg-white"
                        placeholder="e.g. UDYAM"
                    />
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Contact & Tax Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            className="w-full p-2 border rounded text-gray-900 bg-white"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                        </label>
                        <input
                            {...register("phone")}
                            className="w-full p-2 border rounded text-gray-900 bg-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PAN Number
                        </label>
                        <input
                            {...register("pan")}
                            className="w-full p-2 border rounded text-gray-900 bg-white"
                            placeholder="ABCDE1234F"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GSTIN
                        </label>
                        <input
                            {...register("gstIn")}
                            className="w-full p-2 border rounded text-gray-900 bg-white"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
