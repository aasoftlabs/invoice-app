"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setupSchema } from "@/lib/schemas/setupSchema";

// Sub-components
import SetupAdminForm from "@/components/setup/SetupAdminForm";
import CompanyInfoForm from "@/components/setup/CompanyInfoForm";
import BankDetailsForm from "@/components/setup/BankDetailsForm";
import BrandingForm from "@/components/setup/BrandingForm";

export default function SetupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);

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
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    // Check if system is already set up
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.userCount > 0) {
          // System is already set up, redirect to login
          router.replace("/login");
        } else {
          // If pure first run, stop loading
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false); // Should probably show error, but failsafe
      });
  }, [router]);

  const onSubmit = async (data) => {
    try {
      // Setup Page ALWAYS implies First Run (creating admin)
      const payload = {
        ...data,
      };

      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        addToast("Setup Complete! Please login.", "success");
        router.push("/login");
      } else {
        const err = await res.json();
        addToast("Failed: " + err.error, "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error configuring system", "error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
        <span className="ml-2 dark:text-slate-300">
          Verifying System Status...
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center py-10 font-sans">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-8">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 dark:border-slate-700 pb-4">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome! System Setup
          </h1>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This is a one-time setup. You will create the initial Admin
                account and configure the company profile.
              </p>
            </div>

            <SetupAdminForm />
            <CompanyInfoForm />
            <BankDetailsForm />
            <BrandingForm />

            <div className="pt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
              <button
                disabled={isSubmitting}
                type="submit"
                className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Configuring...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Initialize System
                  </>
                )}
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
