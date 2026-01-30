"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  DollarSign,
  TrendingDown,
  Wallet,
  Edit,
  FileText,
  Plus,
  Search,
  Filter,
} from "lucide-react";

export default function PayrollDashboard() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/payroll/employees", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch employees");
        console.error("Failed to fetch employees:", errData);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalEmployees = employees.length;
  const employeesWithSalary = employees.filter((e) => e.salary).length;
  const totalMonthlyPayroll = employees.reduce(
    (sum, e) => sum + (e.salary?.grossSalary || 0),
    0,
  );
  const totalDeductions = employees.reduce(
    (sum, e) => sum + (e.salary?.totalDeductions || 0),
    0,
  );
  const totalNetPayable = employees.reduce(
    (sum, e) => sum + (e.salary?.netSalary || 0),
    0,
  );

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Get unique states from employees
  const uniqueStates = [
    ...new Set(employees.map((e) => e.salary?.state || e.state || "N/A")),
  ]
    .filter(Boolean)
    .sort();

  // Get unique departments from employees
  const uniqueDepartments = [
    ...new Set(employees.map((e) => e.department || "N/A")),
  ]
    .filter(Boolean)
    .sort();

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "with_salary"
          ? !!emp.salary
          : !emp.salary; // setup_pending

    const empState = emp.salary?.state || emp.state || "N/A";
    const matchesState =
      filterState === "all" ? true : empState === filterState;

    const empDepartment = emp.department || "N/A";
    const matchesDepartment =
      filterDepartment === "all" ? true : empDepartment === filterDepartment;

    return matchesSearch && matchesStatus && matchesState && matchesDepartment;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payroll Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage employee salaries and generate slips
          </p>
        </div>
        <button
          onClick={() => router.push("/payroll/generate")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate Slips
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Employees
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {totalEmployees}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {employeesWithSalary} with salary structure
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Monthly Payroll
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(totalMonthlyPayroll)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Gross salary total</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Total Deductions
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(totalDeductions)}
              </p>
              <p className="text-xs text-gray-400 mt-1">PF, ESI, PT, TDS</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Net Payable</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(totalNetPayable)}
              </p>
              <p className="text-xs text-gray-400 mt-1">After all deductions</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700 mr-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 flex-1">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="with_salary">With Salary Structure</option>
              <option value="pending">Setup Pending</option>
            </select>

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="all">All States</option>
              {uniqueStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              <option value="all">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-3">Employee</th>
              <th className="px-6 py-3">State</th>
              <th className="px-6 py-3">Gross Salary</th>
              <th className="px-6 py-3">Deductions</th>
              <th className="px-6 py-3">Net Salary</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-red-500">
                  Error: {error}
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                    {emp.designation && (
                      <div className="text-xs text-gray-400 italic">
                        {emp.designation}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {emp.salary?.state || emp.state || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.salary ? (
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(emp.salary.grossSalary)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Not set
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {emp.salary ? (
                      <span className="text-sm text-red-600">
                        {formatCurrency(emp.salary.totalDeductions)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {emp.salary ? (
                      <span className="text-sm font-semibold text-blue-600">
                        {formatCurrency(emp.salary.netSalary)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          router.push(`/payroll/salary/${emp._id}`)
                        }
                        className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="Edit salary structure"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/payroll/slips?userId=${emp._id}`)
                        }
                        className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded transition-colors"
                        title="View salary slips"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
