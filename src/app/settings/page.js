"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Building2,
  Loader2,
  Landmark,
  Palette,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setupSchema } from "@/lib/schemas/setupSchema";

// Sub-components
import CompanyInfoForm from "@/components/setup/CompanyInfoForm";
import BankDetailsForm from "@/components/setup/BankDetailsForm";
import BrandingForm from "@/components/setup/BrandingForm";
import Button from "@/components/ui/Button";
import { useCompany } from "@/hooks/useCompany";

// Tab Configuration
const TABS = [
  {
    id: "company",
    label: "Company Profile",
    icon: Building2,
    description: "Basic company details and contact info",
  },
  {
    id: "bank",
    label: "Bank Details",
    icon: Landmark,
    description: "Banking information for invoices",
  },
  {
    id: "branding",
    label: "Branding",
    icon: Palette,
    description: "Logos, colors, and visual settings",
  },
];

export default function SettingsPage() {
  const { addToast } = useToast();
  const { loading: hookLoading, fetchCompany, updateCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("company");

  const methods = useForm({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      adminUser: { name: "", email: "", password: "", confirmPassword: "" },
      name: "",
      billingName: "",
      slogan: "",
      tagline: "",
      address: "",
      email: "",
      phone: "",
      registrationNo: "",
      registrationType: "",
      pan: "",
      gstIn: "",
      bankDetails: {
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifscCode: "",
        branch: "",
      },
      formatting: {
        color: "#1d4ed8",
        font: "sans",
      },
      logo: "",
    },
    shouldUnregister: false, // Keep values even when tab is hidden
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  useEffect(() => {
    async function loadData() {
      const result = await fetchCompany();
      if (result.success && result.profile) {
        reset(result.profile);
      }
      setLoading(false);
    }
    loadData();
  }, [reset, fetchCompany]);

  const onSubmit = async (data) => {
    const { adminUser, ...profileData } = data;
    const result = await updateCompany(profileData);

    if (result.success) {
      addToast("Company Settings Saved Successfully!", "success");
    } else {
      addToast("Failed: " + (result.error || "Unknown error"), "error");
    }
  };

  // Error handling to switch tabs if validation fails in hidden tab
  const onError = (errors) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      // Simple logic to detect where the error might be
      // Bank errors
      if (errors.bankDetails) {
        setActiveTab("bank");
        addToast("Please check errors in Bank Details", "error");
        return;
      }
      // Branding errors (unlikely with just optional logo, but consistent)
      if (errors.formatting || errors.logo) {
        setActiveTab("branding");
        addToast("Please check errors in Branding", "error");
        return;
      }
      // Default to company
      setActiveTab("company");
      addToast("Please check errors in Company Profile", "error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  const CurrentTabIcon =
    TABS.find((t) => t.id === activeTab)?.icon || LayoutDashboard;

  return (
    <div className="min-h-screen flex justify-center py-10 font-sans">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden sticky top-10">
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-blue-600" /> Settings
              </h2>
            </div>
            <nav className="p-2 space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-sm"
                      : "text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon
                        className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-slate-500"}`}
                      />
                      {tab.label}
                    </div>
                    {isActive ? (
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-50" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 md:p-8 min-h-[600px]">
            <div className="mb-8 pb-4 border-b border-gray-100 dark:border-slate-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CurrentTabIcon className="w-8 h-8 text-blue-600" />
                {TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1 ml-11">
                {TABS.find((t) => t.id === activeTab)?.description}
              </p>
            </div>

            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="space-y-8 animate-in fade-in duration-300"
              >
                {/* Conditional Rendering */}
                <div className={activeTab === "company" ? "block" : "hidden"}>
                  <CompanyInfoForm />
                </div>

                <div className={activeTab === "bank" ? "block" : "hidden"}>
                  <BankDetailsForm />
                </div>

                <div className={activeTab === "branding" ? "block" : "hidden"}>
                  <BrandingForm />
                </div>

                {/* Save Action - Floating or Fixed at bottom */}
                <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-500 dark:text-slate-400 italic">
                    All changes are saved to the company profile.
                  </div>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
