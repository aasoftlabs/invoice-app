import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import Navbar from "@/components/Navbar";
import CompanyProfile from "@/models/CompanyProfile";
import NewUserForm from "./NewUserForm";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  await connectDB();

  // Fetch users and profile for navbar
  const [users, profile] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).lean(),
    CompanyProfile.findOne({}).lean(),
  ]);

  const serializedUsers = JSON.parse(JSON.stringify(users));
  const serializedProfile = JSON.parse(JSON.stringify(profile));
  const serializedUser = session.user;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar user={serializedUser} profile={serializedProfile} />

      <div className="max-w-5xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          {/* Add User Button handled by Client Component below or modal */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: User List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serializedUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {u.name}
                        </div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold uppercase ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Add User Form */}
          <div>
            <NewUserForm />
          </div>
        </div>
      </div>
    </div>
  );
}
