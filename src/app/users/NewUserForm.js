"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const AVAILABLE_PERMISSIONS = [
  { id: "invoices", label: "Invoices", description: "Access to all invoice pages" },
  { id: "letterhead", label: "Letterhead", description: "Access to letterhead editor" },
  { id: "project", label: "Project Tracker", description: "Access to all project pages" },
  { id: "company", label: "Company Settings", description: "Access to company settings" },
  { id: "payroll", label: "Payroll Management", description: "Manage employee salaries and slips" },
  { id: "users", label: "User Management", description: "Manage users (Admin only)" },
];

export default function NewUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    password: "",
    role: "user",
    permissions: ["invoices", "letterhead", "project", "company"], // Default permissions
  });

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("User created successfully");
        setFormData({
          name: "",
          designation: "",
          email: "",
          password: "",
          role: "user",
          permissions: ["invoices", "letterhead", "project", "company"]
        });
        router.refresh();
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-blue-600" />
        Add New User
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
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
            Designation
          </label>
          <input
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            placeholder="e.g., Senior Developer, Manager"
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            required
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
          >
            <option value="user">User (Restricted)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
        </div>

        {/* Permissions Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Access Permissions
          </label>
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {AVAILABLE_PERMISSIONS.map(perm => (
              <label key={perm.id} className="block cursor-pointer">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    disabled={formData.role === "admin" || (perm.id === "users" && formData.role !== "admin")}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                    <p className="text-xs text-gray-500">{perm.description}</p>
                    {perm.id === "users" && formData.role !== "admin" && (
                      <span className="text-xs text-red-600 italic">(Admin only)</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
            {formData.role === "admin" && (
              <p className="text-xs text-blue-600 mt-2 pt-2 border-t border-gray-200">
                ✓ Admins automatically have full access to all pages
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Create User"
          )}
        </button>
      </form>
    </div>
  );
}
