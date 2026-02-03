import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { useRouter } from "next/navigation";

const AVAILABLE_PERMISSIONS = [
  {
    id: "invoices",
    label: "Invoices",
    description: "Access to all invoice pages",
  },
  {
    id: "letterhead",
    label: "Letterhead",
    description: "Access to letterhead editor",
  },
  {
    id: "project",
    label: "Project Tracker",
    description: "Access to all project pages",
  },
  {
    id: "accounts",
    label: "Accounts & Ledger",
    description: "Manage ledger and transactions",
  },
  {
    id: "company",
    label: "Company Settings",
    description: "Access to company settings",
  },
  {
    id: "payroll",
    label: "Payroll Management",
    description: "Manage employee salaries and slips",
  },
  {
    id: "users",
    label: "User Management",
    description: "Manage users (Admin only)",
  },
  {
    id: "notes",
    label: "Notes & Reminders",
    description: "Personal and shared company notes",
  },
];

export default function EditUserModal({ isOpen, onClose, onSuccess, user }) {
  const router = useRouter();
  const { alert } = useModal();
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    if (user) {
      // Clean permissions before setting
      const cleanedPermissions =
        user.role === "admin"
          ? user.permissions
          : (user.permissions || []).filter(
              (p) => p !== "company" && p !== "users",
            );
      setEditingUser({
        ...user,
        permissions: cleanedPermissions,
      });
    }
  }, [user]);

  const togglePermission = (permissionId) => {
    setEditingUser((prev) => ({
      ...prev,
      permissions: (prev.permissions || []).includes(permissionId)
        ? (prev.permissions || []).filter((p) => p !== permissionId)
        : [...(prev.permissions || []), permissionId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingUser.name,
          designation: editingUser.designation,
          email: editingUser.email,
          role: editingUser.role,
          permissions: editingUser.permissions,
        }),
      });

      if (res.ok) {
        await alert({
          title: "Success",
          message: "User updated successfully",
          variant: "success",
        });
        onSuccess();
        router.refresh();
      } else {
        const err = await res.json();
        await alert({
          title: "Error",
          message: "Error: " + err.error,
          variant: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      await alert({
        title: "Error",
        message: "Failed to update user status",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Edit User
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                required
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Designation
              </label>
              <input
                value={editingUser.designation || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    designation: e.target.value,
                  })
                }
                placeholder="e.g., Senior Developer, Manager"
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                Role *
              </label>
              <select
                value={editingUser.role}
                onChange={(e) => {
                  const newRole = e.target.value;
                  if (newRole === "admin") {
                    setEditingUser({
                      ...editingUser,
                      role: newRole,
                      permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
                    });
                  } else {
                    setEditingUser({
                      ...editingUser,
                      role: newRole,
                      permissions: ["invoices", "letterhead", "project"],
                    });
                  }
                }}
                className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 border-gray-300 dark:border-slate-700"
              >
                <option value="user">User (Restricted)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Page Access Permissions
            </label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      perm.id === "notes"
                        ? true
                        : editingUser.permissions?.includes(perm.id) || false
                    }
                    onChange={() => togglePermission(perm.id)}
                    disabled={
                      perm.id === "notes" ||
                      (perm.id === "users" && editingUser.role !== "admin") ||
                      (perm.id === "company" && editingUser.role !== "admin")
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {perm.label}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {perm.id === "company" && editingUser.role !== "admin"
                        ? "(Admin only)"
                        : perm.description}
                    </p>
                  </div>
                </label>
              ))}
              {editingUser.role === "admin" && (
                <p className="col-span-2 text-xs text-blue-600 dark:text-blue-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                  ✓ Admins start with full access, but individual permissions
                  can be modified above
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
