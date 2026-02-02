"use client";

import { useState } from "react";
import { useModal } from "@/contexts/ModalContext";
import { Edit2, Trash2, X, Loader2, UserPlus } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";
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

export default function UserManagement({ users: initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { confirm, alert } = useModal();

  const [newUser, setNewUser] = useState({
    name: "",
    designation: "",
    email: "",
    password: "",
    role: "user",
    permissions: ["invoices", "letterhead", "project"],
  });

  const handleDelete = async (userId, userName) => {
    if (
      !(await confirm({
        title: "Delete User",
        message: `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
      }))
    ) {
      return;
    }

    const res = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      await alert({
        title: "Success",
        message: "User deleted successfully",
        variant: "success",
      });
      setUsers(users.filter((u) => u._id !== userId));
      router.refresh();
    } else {
      const err = await res.json();
      await alert({
        title: "Error",
        message: "Error: " + err.error,
        variant: "danger",
      });
    }
  };

  const handleEditSubmit = async (e) => {
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
        const updatedUser = await res.json();
        await alert({
          title: "Success",
          message: "User updated successfully",
          variant: "success",
        });
        setUsers(
          users.map((u) => (u._id === updatedUser._id ? updatedUser : u)),
        );
        setEditingUser(null);
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        await alert({
          title: "Success",
          message: "User created successfully",
          variant: "success",
        });
        setNewUser({
          name: "",
          designation: "",
          email: "",
          password: "",
          role: "user",
          permissions: ["invoices", "letterhead", "project"],
        });
        setIsAddModalOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        await alert({
          title: "Error",
          message: "Error: " + err.error,
          variant: "danger",
        });
      }
    } catch (e) {
      console.error(e);
      await alert({
        title: "Error",
        message: "Failed to create user",
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId, isEdit = false) => {
    if (isEdit) {
      setEditingUser((prev) => ({
        ...prev,
        permissions: (prev.permissions || []).includes(permissionId)
          ? (prev.permissions || []).filter((p) => p !== permissionId)
          : [...(prev.permissions || []), permissionId],
      }));
    } else {
      setNewUser((prev) => ({
        ...prev,
        permissions: (prev.permissions || []).includes(permissionId)
          ? (prev.permissions || []).filter((p) => p !== permissionId)
          : [...(prev.permissions || []), permissionId],
      }));
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          User Management
        </h1>
        <Spotlight
          className="bg-rose-600 rounded-lg shadow-sm hover:bg-rose-700 transition-colors cursor-pointer"
          spotlightColor="rgba(255, 255, 255, 0.2)"
        >
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white font-medium w-full h-full"
          >
            <UserPlus className="w-5 h-5" />
            New User
          </button>
        </Spotlight>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Designation</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Permissions</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {users.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {u.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {u.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.designation ? (
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {u.designation}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      Not set
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold uppercase ${u.role === "admin" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.role === "admin" ? (
                    <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
                      Full Access
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.permissions && u.permissions.length > 0 ? (
                        <>
                          {u.permissions.slice(0, 3).map((perm) => (
                            <span
                              key={perm}
                              className="text-xs bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded"
                            >
                              {perm}
                            </span>
                          ))}
                          {u.permissions.length > 3 && (
                            <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded">
                              +{u.permissions.length - 3}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No permissions
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                  {u.joiningDate
                    ? new Date(u.joiningDate).toLocaleDateString("en-GB")
                    : new Date(u.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        const cleanedPermissions =
                          u.role === "admin"
                            ? u.permissions
                            : (u.permissions || []).filter(
                              (p) => p !== "company" && p !== "users",
                            );
                        setEditingUser({
                          ...u,
                          permissions: cleanedPermissions,
                        });
                      }}
                      className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 p-1 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors"
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                Add New User
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    value={newUser.designation}
                    onChange={(e) =>
                      setNewUser({ ...newUser, designation: e.target.value })
                    }
                    placeholder="e.g., Senior Developer, Manager"
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                    minLength={6}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      if (newRole === "admin") {
                        setNewUser({
                          ...newUser,
                          role: newRole,
                          permissions: AVAILABLE_PERMISSIONS.map((p) => p.id),
                        });
                      } else {
                        setNewUser({
                          ...newUser,
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
                            : newUser.permissions.includes(perm.id)
                        }
                        onChange={() => togglePermission(perm.id, false)}
                        disabled={
                          perm.id === "notes" ||
                          (perm.id === "users" && newUser.role !== "admin") ||
                          (perm.id === "company" && newUser.role !== "admin")
                        }
                        className="w-4 h-4 text-rose-600 rounded focus:ring-2 focus:ring-rose-500 mt-0.5"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          {perm.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {perm.id === "company" && newUser.role !== "admin"
                            ? "(Admin only)"
                            : perm.description}
                        </p>
                      </div>
                    </label>
                  ))}
                  {newUser.role === "admin" && (
                    <p className="col-span-2 text-xs text-rose-600 dark:text-rose-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                      ✓ Admins start with full access, but individual
                      permissions can be unchecked as needed
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create User"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Edit User
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6">
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
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
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
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
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
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-rose-500 outline-none text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
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
                            : editingUser.permissions?.includes(perm.id) ||
                            false
                        }
                        onChange={() => togglePermission(perm.id, true)}
                        disabled={
                          perm.id === "notes" ||
                          (perm.id === "users" &&
                            editingUser.role !== "admin") ||
                          (perm.id === "company" &&
                            editingUser.role !== "admin")
                        }
                        className="w-4 h-4 text-rose-600 rounded focus:ring-2 focus:ring-rose-500 mt-0.5"
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
                    <p className="col-span-2 text-xs text-rose-600 dark:text-rose-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                      ✓ Admins start with full access, but individual
                      permissions can be modified above
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
      )}
    </>
  );
}
