"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Settings } from "lucide-react";

export default function PayrollSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        pfRate: 12,
        pfBasicThreshold: 15000,
        esiEmployeeRate: 0.75,
        esiEmployerRate: 3.25,
        esiGrossThreshold: 21000,
        defaultTaxRegime: "new",
        standardDeduction: 50000,
        ptStates: [],
    });
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/payroll/settings");
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    ...data.settings,
                    ptStates: data.settings.ptStates || [],
                });
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) : value,
        }));
    };

    const handlePtChange = (stateIndex, field, value) => {
        const newStates = [...settings.ptStates];
        newStates[stateIndex][field] = value;
        setSettings({ ...settings, ptStates: newStates });
    };

    const handleSlabChange = (stateIndex, slabIndex, field, value) => {
        const newStates = [...settings.ptStates];
        newStates[stateIndex].slabs[slabIndex][field] = parseFloat(value);
        setSettings({ ...settings, ptStates: newStates });
    };

    const addSlab = (stateIndex) => {
        const newStates = [...settings.ptStates];
        newStates[stateIndex].slabs.push({ minSalary: 0, maxSalary: 0, amount: 0 });
        setSettings({ ...settings, ptStates: newStates });
    };

    const removeSlab = (stateIndex, slabIndex) => {
        const newStates = [...settings.ptStates];
        newStates[stateIndex].slabs.splice(slabIndex, 1);
        setSettings({ ...settings, ptStates: newStates });
    };

    const addState = () => {
        setSettings({
            ...settings,
            ptStates: [
                ...settings.ptStates,
                { state: "", slabs: [{ minSalary: 0, maxSalary: 0, amount: 0 }] },
            ],
        });
    };

    const removeState = (index) => {
        const newStates = [...settings.ptStates];
        newStates.splice(index, 1);
        setSettings({ ...settings, ptStates: newStates });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/payroll/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                alert("Settings saved successfully");
            } else {
                alert("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Payroll Settings</h1>
                    <p className="text-gray-500">Configure global payroll parameters and PT slabs</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Save Settings
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${activeTab === "general"
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-transparent text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            General & Statutory
                        </button>
                        <button
                            onClick={() => setActiveTab("pt")}
                            className={`w-full text-left px-4 py-3 text-sm font-medium border-l-4 transition-colors ${activeTab === "pt"
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-transparent text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            Professional Tax (PT)
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 space-y-6">
                    {activeTab === "general" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                                    Provident Fund (PF)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="PF Rate (%)"
                                        name="pfRate"
                                        value={settings.pfRate}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Basic Salary Threshold (₹)"
                                        name="pfBasicThreshold"
                                        value={settings.pfBasicThreshold}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                                    ESI
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="Employee Rate (%)"
                                        name="esiEmployeeRate"
                                        value={settings.esiEmployeeRate}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Employer Rate (%)"
                                        name="esiEmployerRate"
                                        value={settings.esiEmployerRate}
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        label="Gross Salary Threshold (₹)"
                                        name="esiGrossThreshold"
                                        value={settings.esiGrossThreshold}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
                                    TDS Defaults
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Default Tax Regime
                                        </label>
                                        <select
                                            name="defaultTaxRegime"
                                            value={settings.defaultTaxRegime}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                                        >
                                            <option value="new" className="text-gray-900">New Regime</option>
                                            <option value="old" className="text-gray-900">Old Regime</option>
                                        </select>
                                    </div>
                                    <InputField
                                        label="Standard Deduction (Old Regime) (₹)"
                                        name="standardDeduction"
                                        value={settings.standardDeduction}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "pt" && (
                        <div className="space-y-6">
                            {settings.ptStates.map((ptState, stateIndex) => (
                                <div
                                    key={stateIndex}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <input
                                            type="text"
                                            value={ptState.state}
                                            onChange={(e) =>
                                                handlePtChange(stateIndex, "state", e.target.value)
                                            }
                                            placeholder="State Name"
                                            className="text-lg font-semibold text-gray-900 border-none focus:ring-0 p-0 w-full bg-transparent placeholder:text-gray-400"
                                        />
                                        <button
                                            onClick={() => removeState(stateIndex)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 uppercase">
                                            <div>Min Salary</div>
                                            <div>Max Salary</div>
                                            <div>PT Amount</div>
                                        </div>
                                        {ptState.slabs.map((slab, slabIndex) => (
                                            <div key={slabIndex} className="grid grid-cols-3 gap-4 items-center">
                                                <input
                                                    type="number"
                                                    value={slab.minSalary}
                                                    onChange={(e) =>
                                                        handleSlabChange(
                                                            stateIndex,
                                                            slabIndex,
                                                            "minSalary",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                                />
                                                <input
                                                    type="number"
                                                    value={slab.maxSalary}
                                                    onChange={(e) =>
                                                        handleSlabChange(
                                                            stateIndex,
                                                            slabIndex,
                                                            "maxSalary",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={slab.amount}
                                                        onChange={(e) =>
                                                            handleSlabChange(
                                                                stateIndex,
                                                                slabIndex,
                                                                "amount",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    />
                                                    <button
                                                        onClick={() => removeSlab(stateIndex, slabIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addSlab(stateIndex)}
                                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-2"
                                        >
                                            <Plus className="w-4 h-4" /> Add Slab
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addState}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Add State Configuration
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function InputField({ label, name, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
        </div>
    );
}
