import { User } from "lucide-react";

export default function SalaryConfiguration({ salary, handleChange }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                    </label>
                    <input
                        type="text"
                        value={salary.employeeId || ""}
                        onChange={(e) =>
                            handleChange({
                                target: { name: "employeeId", value: e.target.value },
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="EMP001"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                    </label>
                    <input
                        type="text"
                        value={salary.department || ""}
                        onChange={(e) =>
                            handleChange({
                                target: { name: "department", value: e.target.value },
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                        placeholder="General"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Joining
                    </label>
                    <input
                        type="date"
                        value={
                            salary.joiningDate
                                ? new Date(salary.joiningDate).toISOString().split("T")[0]
                                : ""
                        }
                        onChange={(e) =>
                            handleChange({
                                target: { name: "joiningDate", value: e.target.value },
                            })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        State (for PT)
                    </label>
                    <select
                        name="state"
                        value={salary.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white cursor-pointer"
                    >
                        <option value="Maharashtra" className="text-gray-900">
                            Maharashtra
                        </option>
                        <option value="Karnataka" className="text-gray-900">
                            Karnataka
                        </option>
                        <option value="Tamil Nadu" className="text-gray-900">
                            Tamil Nadu
                        </option>
                        <option value="West Bengal" className="text-gray-900">
                            West Bengal
                        </option>
                        <option value="Gujarat" className="text-gray-900">
                            Gujarat
                        </option>
                        <option value="Telangana" className="text-gray-900">
                            Telangana
                        </option>
                        <option value="Andhra Pradesh" className="text-gray-900">
                            Andhra Pradesh
                        </option>
                        <option value="Madhya Pradesh" className="text-gray-900">
                            Madhya Pradesh
                        </option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Regime
                    </label>
                    <select
                        name="taxRegime"
                        value={salary.taxRegime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white cursor-pointer"
                    >
                        <option value="new" className="text-gray-900">
                            New Regime (Default)
                        </option>
                        <option value="old" className="text-gray-900">
                            Old Regime
                        </option>
                    </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="checkbox"
                        id="pfApplicable"
                        name="pfApplicable"
                        checked={salary.pfApplicable}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                        htmlFor="pfApplicable"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        PF Applicable
                    </label>
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="checkbox"
                        id="esiApplicable"
                        name="esiApplicable"
                        checked={salary.esiApplicable}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                        htmlFor="esiApplicable"
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                        ESI Applicable
                    </label>
                </div>
            </div>
        </div>
    );
}
