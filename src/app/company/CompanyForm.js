"use client";

import { useState } from "react";
import { Save, Building2 } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";
import Spotlight from "@/components/ui/Spotlight";
import { useCompany } from "@/hooks/useCompany";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CompanyForm({ initialData }) {
  const { alert } = useModal();
  const { addToast } = useToast();
  const { loading, updateCompany } = useCompany();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    website: initialData?.website || "",
    logo: initialData?.logo || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await updateCompany(formData);

    if (result.success) {
      addToast("Company settings updated successfully", "success");
    } else {
      await alert({
        title: "Error",
        message: result.error || "Failed to update company settings",
        variant: "danger",
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 overflow-hidden">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        Company Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Acme Corp"
        />

        <Input
          label="Email"
          required
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contact@company.com"
        />

        <Input
          label="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+91 ..."
        />

        <Input
          label="Address"
          textarea
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          rows={3}
          placeholder="Full correspondence address"
        />

        <Input
          label="Website"
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          placeholder="https://example.com"
        />

        <div className="space-y-2">
          <Input
            label="Logo URL"
            type="url"
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            placeholder="https://example.com/logo.png"
          />
          {formData.logo && (
            <div className="mt-2 p-2 border dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-900/50 inline-block">
              <Image
                src={formData.logo}
                alt="Logo preview"
                width={100}
                height={64}
                unoptimized
                className="h-16 w-auto object-contain"
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <Spotlight
            className="w-full bg-blue-600 dark:bg-blue-700 rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
            spotlightColor="rgba(255, 255, 255, 0.25)"
          >
            <Button
              type="submit"
              isLoading={loading}
              icon={Save}
              className="w-full h-12 bg-transparent hover:bg-transparent shadow-none"
            >
              Save Company Settings
            </Button>
          </Spotlight>
        </div>
      </form>
    </div>
  );
}
