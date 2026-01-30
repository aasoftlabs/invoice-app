import { Filter } from "lucide-react";

export default function InvoiceFilters({ filters, setFilters }) {
    const currentYear = new Date().getFullYear();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700 mr-2">
                    <Filter className="w-4 h-4" />
                    <span className="font-medium text-sm">Filters:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Month Filter */}
                    <select
                        value={filters.month}
                        onChange={(e) =>
                            setFilters({ ...filters, month: e.target.value === "all" ? "all" : parseInt(e.target.value) })
                        }
                        className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                    >
                        <option value="all">All Months</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <option key={month} value={month}>
                                {new Date(2024, month - 1).toLocaleString("default", {
                                    month: "long",
                                })}
                            </option>
                        ))}
                    </select>

                    {/* Year Filter */}
                    <select
                        value={filters.year}
                        onChange={(e) =>
                            setFilters({ ...filters, year: e.target.value === "all" ? "all" : parseInt(e.target.value) })
                        }
                        className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                    >
                        <option value="all">All Years</option>
                        <option value="all">All Years</option>
                        {Array.from({ length: 6 }, (_, i) => 2025 + i).map(
                            (year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ),
                        )}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                        }
                        className="border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
