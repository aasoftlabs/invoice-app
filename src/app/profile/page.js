import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import EmployeeSalary from "@/models/EmployeeSalary";
import PayrollSettings from "@/models/PayrollSettings";
import { calculateCompleteSalary } from "@/lib/payrollCalculations";
import ProfileForm from "./ProfileForm";
import SalaryDetails from "@/components/profile/SalaryDetails";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const user = await User.findById(session.user.id).lean();

  if (!user) redirect("/login");

  const serializedUser = {
    ...session.user,
    name: user.name,
    email: user.email,
    designation: user.designation,
    employeeId: user.employeeId,
    department: user.department,
    joiningDate: user.joiningDate,
  };

  // Fetch Payroll Data
  const salaryDoc = await EmployeeSalary.findOne({ userId: user._id }).lean();
  let salaryDetails = null;

  if (salaryDoc) {
    let settings = await PayrollSettings.findOne({ companyId: "default" });
    if (!settings) settings = { companyId: "default" }; // Fallback blank settings if not found to avoid crash

    const calculated = calculateCompleteSalary(salaryDoc, settings);

    salaryDetails = {
      ...salaryDoc,
      grossSalary: calculated.gross,
      totalDeductions: calculated.deductions.total,
      netSalary: calculated.netSalary,
      deductions: calculated.deductions,
    };
    // Serialization for client component if needed (mongoose docs to POJO)
    salaryDetails = JSON.parse(JSON.stringify(salaryDetails));
  }

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          My Profile
        </h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div>
            <ProfileForm user={serializedUser} />
          </div>

          <div>
            <SalaryDetails salary={salaryDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
