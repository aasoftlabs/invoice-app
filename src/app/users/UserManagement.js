"use client";

import { useState } from "react";
import { Edit2, Trash2, X, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const AVAILABLE_PERMISSIONS = [
    { id: "invoices", label: "Invoices", description: "Access to all invoice pages" },
    { id: "letterhead", label: "Letterhead", description: "Access to letterhead editor" },
    { id: "project", label: "Project Tracker", description: "Access to all project pages" },
    { id: "accounts", label: "Accounts & Ledger", description: "Manage ledger and transactions" },
    { id: "company", label: "Company Settings", description: "Access to company settings" },
    { id: "payroll", label: "Payroll Management", description: "Manage employee salaries and slips" },
    { id: "users", label: "User Management", description: "Manage users (Admin only)" },
];

export default function UserManagement({ users: initialUsers }) {
    const router = useRouter();
    const [users, setUsers] = useState(initialUsers);
    const [editingUser, setEditingUser] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [newUser, setNewUser] = useState({
        name: "",
        designation: "",
        email: "",
        password: "",
        role: "user",
        permissions: ["invoices", "letterhead", "project", "company"],
    });

    const handleDelete = async (userId, userName) => {
        if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("User deleted successfully");
                setUsers(users.filter(u => u._id !== userId));
                router.refresh();
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to delete user");
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
                alert("User updated successfully");
                setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
                setEditingUser(null);
                router.refresh();
            } else {
                const err = await res.json();
                alert("Error: " + err.error);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to update user");
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
                alert("User created successfully");
                setNewUser({
                    name: "",
                    designation: "",
                    email: "",
                    password: "",
                    role: "user",
                    permissions: ["invoices", "letterhead", "project", "company"],
                });
                setIsAddModalOpen(false);
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

    const togglePermission = (permissionId, isEdit = false) => {
        if (isEdit) {
            setEditingUser(prev => ({
                ...prev,
                permissions: (prev.permissions || []).includes(permissionId)
                    ? (prev.permissions || []).filter(p => p !== permissionId)
                    : [...(prev.permissions || []), permissionId]
            }));
        } else {
            setNewUser(prev => ({
                ...prev,
                permissions: (prev.permissions || []).includes(permissionId)
                    ? (prev.permissions || []).filter(p => p !== permissionId)
                    : [...(prev.permissions || []), permissionId]
            }));
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <UserPlus className="w-5 h-5" />
                    Add New User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                        <tr>
                            <th className="px-6 py-3">User</th>
                            <th className="px-6 py-3">Designation</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Permissions</th>
                            <th className="px-6 py-3">Joined</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {u.name}
                                    </div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {u.designation ? (
                                        <span className="text-sm text-gray-700">{u.designation}</span>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Not set</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-semibold uppercase ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {u.role === "admin" ? (
                                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">
                                            Full Access
                                        </span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {u.permissions && u.permissions.length > 0 ? (
                                                <>
                                                    {u.permissions.slice(0, 3).map(perm => (
                                                        <span key={perm} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                                                            {perm}
                                                        </span>
                                                    ))}
                                                    {u.permissions.length > 3 && (
                                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            +{u.permissions.length - 3}
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No permissions</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {u.joiningDate ? new Date(u.joiningDate).toLocaleDateString('en-GB') : new Date(u.createdAt).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => setEditingUser(u)}
                                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit user"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(u._id, u.name)}
                                            className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
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
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                                Add New User
                            </h2>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        required
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Designation
                                    </label>
                                    <input
                                        value={newUser.designation}
                                        onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
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
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
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
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                        minLength={6}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="user">User (Restricted)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Page Access Permissions
                                </label>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newUser.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id, false)}
                                                disabled={newUser.role === "admin" || (perm.id === "users" && newUser.role !== "admin")}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                                                <p className="text-xs text-gray-500">{perm.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                    {newUser.role === "admin" && (
                                        <p className="col-span-2 text-xs text-blue-600 pt-2 border-t border-gray-200">
                                            ✓ Admins automatically have full access to all pages
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
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
                                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        required
                                        value={editingUser.name}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Designation
                                    </label>
                                    <input
                                        value={editingUser.designation || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
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
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                                    >
                                        <option value="user">User (Restricted)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Page Access Permissions
                                </label>
                                <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    {AVAILABLE_PERMISSIONS.map(perm => (
                                        <label key={perm.id} className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editingUser.permissions?.includes(perm.id) || false}
                                                onChange={() => togglePermission(perm.id, true)}
                                                disabled={editingUser.role === "admin" || (perm.id === "users" && editingUser.role !== "admin")}
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                                                <p className="text-xs text-gray-500">{perm.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                    {editingUser.role === "admin" && (
                                        <p className="col-span-2 text-xs text-blue-600 pt-2 border-t border-gray-200">
                                            ✓ Admins automatically have full access to all pages
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
