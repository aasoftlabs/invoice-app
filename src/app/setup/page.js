"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2, Upload, User, Lock, Mail } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);

  const [formData, setFormData] = useState({
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
      color: "#1d4ed8", // blue-700 default
      font: "sans",
    },
    logo: "", // Base64
  });

  // Admin User Data (Only for first run)
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Check for existing profile and if users exist
    fetch("/api/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.userCount === 0) {
          setIsFirstRun(true);
        }
        if (data.profile) {
          setFormData((prev) => ({ ...prev, ...data.profile }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isFirstRun) {
      if (adminData.password !== adminData.confirmPassword) {
        addToast("Passwords do not match!", "error");
        return;
      }
      if (adminData.password.length < 6) {
        addToast("Password must be at least 6 characters", "error");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        adminUser: isFirstRun ? adminData : null,
      };

      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        addToast(isFirstRun ? "Setup Complete! Please login." : "Company Profile Saved Successfully!", "success");
        if (isFirstRun) router.push("/login");
      } else {
        const err = await res.json();
        addToast("Failed: " + err.error, "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Error saving profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            {isFirstRun
              ? "Welcome! Setup Admin & Company"
              : "Company Profile Setup"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 0: Admin User (First Run Only) */}
          {isFirstRun && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Admin Account Setup
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    required={isFirstRun}
                    name="name"
                    value={adminData.name}
                    onChange={handleAdminChange}
                    className="w-full p-2 border rounded text-gray-900 bg-white"
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Login)
                  </label>
                  <input
                    required={isFirstRun}
                    type="email"
                    name="email"
                    value={adminData.email}
                    onChange={handleAdminChange}
                    className="w-full p-2 border rounded text-gray-900 bg-white"
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    required={isFirstRun}
                    type="password"
                    name="password"
                    value={adminData.password}
                    onChange={handleAdminChange}
                    className="w-full p-2 border rounded text-gray-900 bg-white"
                    placeholder="******"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    required={isFirstRun}
                    type="password"
                    name="confirmPassword"
                    value={adminData.confirmPassword}
                    onChange={handleAdminChange}
                    className="w-full p-2 border rounded text-gray-900 bg-white"
                    placeholder="******"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Basic Info */}
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
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  placeholder="e.g. AA SoftLabs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slogan / Tagline (Optional)
                </label>
                <input
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  placeholder="e.g. Next-Gen Web Engineering"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.billingName}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setFormData((prev) => ({ ...prev, billingName: "" }));
                      } else {
                        // Initialize with current name if empty to avoid confusion, or leave blank
                        setFormData((prev) => ({ ...prev, billingName: prev.name }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use a different name for Billing? (Bill From)
                  </span>
                </label>
                {formData.billingName !== "" && ( // Check against undefined/null too if needed, but logic above sets it
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Name
                    </label>
                    <input
                      name="billingName"
                      value={formData.billingName}
                      onChange={handleChange}
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
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  placeholder="e.g. Next-Gen Web & Mobile Engineering"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  placeholder="Full Business Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration No
                </label>
                <input
                  name="registrationNo"
                  value={formData.registrationNo}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                  placeholder="UDYAM-XX-XX..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Type / Source
                </label>
                <input
                  name="registrationType"
                  value={formData.registrationType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                  placeholder="e.g. UDYAM"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Tax */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Contact & Tax Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <input
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN
                </label>
                <input
                  name="gstIn"
                  value={formData.gstIn}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bank Details */}
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
                  name="bankDetails.bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  name="bankDetails.accountName"
                  value={formData.bankDetails.accountName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                </label>
                <input
                  name="bankDetails.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Branding & Styling */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Branding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="formatting.color"
                    value={formData.formatting.color}
                    onChange={handleChange}
                    className="h-10 w-20 rounded p-1 border cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">
                    {formData.formatting.color}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium flex items-center gap-2 shadow-sm">
                    <Upload className="w-4 h-4" /> Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Preview"
                      className="h-12 w-auto object-contain border p-1 rounded bg-white"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: PNG with transparent background
                </p>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="pt-6 border-t flex justify-end">
            <button
              disabled={saving}
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-5 h-5" />{" "}
                  {isFirstRun ? "Create Account & Profile" : "Save Profile"}
                </>
              )}
            </button>
          </div>
        </form>
      </div >
    </div >
  );
}
