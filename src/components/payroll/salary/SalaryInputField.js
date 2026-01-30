export default function SalaryInputField({
    label,
    name,
    value,
    onChange,
    required = false,
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    ₹
                </span>
                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="0"
                />
            </div>
        </div>
    );
}
