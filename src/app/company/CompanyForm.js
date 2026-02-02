"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Upload } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Image from "next/image";
import { Building2 } from "lucide-react"; // Added Building2 import
import Spotlight from "@/components/ui/Spotlight";

export default function CompanyForm({ initialData }) {
    const router = useRouter();
    const { alert } = useModal(); // Added this line
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        website: profile?.website || "",
        logo: profile?.logo || "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/company", {
                method: profile ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                await alert({
                    title: "Success",
                    message: "Company settings updated successfully",
                    variant: "success",
                });
            } else {
                const err = await res.json();
                await alert({
                    title: "Error",
                    message: "Error: " + err.error,
                    variant: "danger",
                });
            }
        } catch (error) {
            console.error("Error saving company settings:", error);
            await alert({
                title: "Error",
                message: "Failed to update company settings",
                variant: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name <span className="text-red-500">{"*"}</span>
                    </label>
                    <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">{"*"}</span>
                    </label>
                    <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                    </label>
                    <input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                    </label>
                    <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo URL
                    </label>
                    <input
                        type="url"
                        value={formData.logo}
                        onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                    />
                    {formData.logo && (
                        <div className="mt-2">
                            <Image
                                src={formData.logo}
                                alt="Logo preview"
                                width={100}
                                height={64}
                                unoptimized
                                className="h-16 w-auto object-contain border rounded"
                            />
                        </div>
                    )}
                </div>

                <Spotlight
                    className="w-full bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
                    spotlightColor="rgba(255, 255, 255, 0.25)"
                >
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full text-white py-2 font-medium flex items-center justify-center gap-2 disabled:opacity-70 h-full"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Save Company Settings"
                        )}
                    </button>
                </Spotlight>
            </form>
        </div>
    );
}
