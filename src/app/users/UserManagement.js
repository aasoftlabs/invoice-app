"use client";

import { useState, useEffect } from "react";
import { useModal } from "@/contexts/ModalContext";
import { Edit2, Trash2, UserPlus } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";
import { useRouter } from "next/navigation";
import AddUserModal from "@/components/users/AddUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import PermissionGate from "@/components/ui/PermissionGate";

export default function UserManagement({ users: initialUsers }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { confirm, alert } = useModal();

  // Update state when props change (from router.refresh)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

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

  return (
    <PermissionGate permission="users">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          User Management
        </h1>
        <Spotlight
          className="bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
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
                              className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
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
                      onClick={() => setEditingUser(u)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
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
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          router.refresh();
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={() => {
          setEditingUser(null);
          router.refresh();
        }}
        user={editingUser}
      />
    </PermissionGate>
  );
}
