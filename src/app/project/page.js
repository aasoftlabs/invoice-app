"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatsCard from "@/components/project/StatsCard";
import MonthlyChart from "@/components/project/MonthlyChart";
import StatusBadge from "@/components/project/StatusBadge";
import { Calendar, CheckCircle, ListTodo, FolderKanban, User, Save } from "lucide-react";

export default function ProjectDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState(null);
    const [workLogs, setWorkLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    // Filters
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [filters, setFilters] = useState({
        year: currentYear,
        month: currentMonth,
        userId: session?.user?.role === "admin" ? "" : session?.user?.id
    });

    const [users, setUsers] = useState([]);

    // Work log form
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        projectId: "",
        taskId: "",
        details: "",
        status: "In Progress",
        remarks: ""
    });

    useEffect(() => {
        if (session) {
            fetchDashboardData();
            fetchWorkLogs();
            fetchProjects();
            fetchTasks();
            if (session.user.role === "admin") {
                fetchUsers();
            }
        }
    }, [session, filters]);

    useEffect(() => {
        if (formData.projectId) {
            const projectTasks = tasks.filter(t => t.projectId?._id === formData.projectId);
            setFilteredTasks(projectTasks);
        } else {
            setFilteredTasks([]);
        }
    }, [formData.projectId, tasks]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                year: filters.year,
                ...(filters.userId && { userId: filters.userId })
            });

            const res = await fetch(`/api/dashboard/stats?${params}`);
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkLogs = async () => {
        try {
            const params = new URLSearchParams({
                month: filters.month,
                year: filters.year,
                ...(filters.userId && { userId: filters.userId })
            });

            const res = await fetch(`/api/worklogs?${params}`);
            const data = await res.json();
            if (data.success) {
                setWorkLogs(data.data.slice(0, 10)); // Latest 10 logs
            }
        } catch (error) {
            console.error("Error fetching work logs:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (data.success) setProjects(data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/tasks");
            const data = await res.json();
            if (data.success) setTasks(data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSubmitLog = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const res = await fetch("/api/worklogs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                alert("Work log submitted successfully!");
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    projectId: "",
                    taskId: "",
                    details: "",
                    status: "In Progress",
                    remarks: ""
                });
                fetchWorkLogs();
                fetchDashboardData();
            } else {
                alert("Error: " + data.error);
            }
        } catch (error) {
            console.error("Error submitting work log:", error);
            alert("Error submitting work log");
        } finally {
            setFormLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Project Tracker</h1>
                        <p className="text-gray-600 mt-1">Monitor your project progress and daily work</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <select
                                value={filters.month}
                                onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                    <option key={month} value={month}>
                                        {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* User Filter (Admin Only) */}
                        {session?.user?.role === "admin" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    User
                                </label>
                                <select
                                    value={filters.userId}
                                    onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Users</option>
                                    {users.map(user => (
                                        <option key={user._id} value={user._id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Log Entry Form */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Quick Log Entry
                    </h3>
                    <form onSubmit={handleSubmitLog} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <select
                                    value={formData.projectId}
                                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value, taskId: "" })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(project => (
                                        <option key={project._id} value={project._id}>{project.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                                <select
                                    value={formData.taskId}
                                    onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!formData.projectId}
                                >
                                    <option value="">Select Task</option>
                                    {filteredTasks.map(task => (
                                        <option key={task._id} value={task._id}>{task.taskName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="Not Started">Not Started</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Details</label>
                            <textarea
                                value={formData.details}
                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe what you worked on today..."
                                required
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <input
                                type="text"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                placeholder="Remarks (optional)"
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
                            />
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                <Save className="w-4 h-4" />
                                {formLoading ? "Submitting..." : "Submit Log"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatsCard
                        title="Total Projects"
                        value={stats?.stats?.totalProjects || 0}
                        icon={FolderKanban}
                        color="blue"
                    />
                    <StatsCard
                        title="Completed Projects"
                        value={stats?.stats?.completedProjects || 0}
                        icon={CheckCircle}
                        color="green"
                    />
                    <StatsCard
                        title="Total Tasks"
                        value={stats?.stats?.totalTasks || 0}
                        icon={ListTodo}
                        color="purple"
                    />
                    <StatsCard
                        title="Completed Tasks"
                        value={stats?.stats?.completedTasks || 0}
                        icon={CheckCircle}
                        color="orange"
                    />
                </div>

                {/* Current Active Project/Task */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Project / Task</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Project</p>
                            <p className="text-lg font-semibold text-blue-600">{stats?.currentActive?.project}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Task</p>
                            <p className="text-lg font-semibold text-purple-600">{stats?.currentActive?.task}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Graph */}
                {stats?.monthlyData && (
                    <div className="mb-6">
                        <MonthlyChart data={stats.monthlyData} />
                    </div>
                )}

                {/* Recent Work Logs */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Work Logs</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {workLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No work logs found for the selected period
                                        </td>
                                    </tr>
                                ) : (
                                    workLogs.map((log) => (
                                        <tr key={log._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(log.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.projectId?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {log.taskId?.taskName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <StatusBadge status={log.status} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {log.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
