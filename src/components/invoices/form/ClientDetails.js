import { useFormContext } from "react-hook-form";

export default function ClientDetails() {
    const { register, formState: { errors } } = useFormContext();

    return (
        <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Client Details</h3>

            <input
                placeholder="Client / Contact Name"
                {...register("clientName")}
                className={`w-full mb-2 p-2 border rounded text-sm ${errors.clientName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.clientName && <p className="text-xs text-red-500 mb-2">{errors.clientName.message}</p>}

            <input
                placeholder="Company Name"
                {...register("clientCompany")}
                className={`w-full mb-2 p-2 border rounded text-sm ${errors.clientCompany ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.clientCompany && <p className="text-xs text-red-500 mb-2">{errors.clientCompany.message}</p>}

            <textarea
                placeholder="Address"
                {...register("clientAddress")}
                className={`w-full mb-2 p-2 border rounded text-sm h-20 ${errors.clientAddress ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.clientAddress && <p className="text-xs text-red-500 mb-2">{errors.clientAddress.message}</p>}

            <input
                placeholder="Client GSTIN (Optional)"
                {...register("clientGst")}
                className="w-full p-2 border border-gray-300 rounded text-sm"
            />
        </div>
    );
}
