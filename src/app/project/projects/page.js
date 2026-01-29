"use client";

import React, { Fragment, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StatusBadge from "@/components/project/StatusBadge";
import { FolderKanban, ChevronDown, ChevronRight, CheckCircle, XCircle, Plus } from "lucide-react";
import AddProjectModal from "@/components/project/AddProjectModal";

export default function ProjectsPage() {
    const { data: session, status } = useSession();
    const [projects, setProjects] = useState([]);
    const [projectTasks, setProjectTasks] = useState({});
    const [expandedProjects, setExpandedProjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (session) {
            fetchProjects();
        }
    }, [session]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/projects");
            const data = await res.json();
            if (data.success) setProjects(data.data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectTasks = async (projectId) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/tasks`);
            const data = await res.json();
            if (data.success) {
                setProjectTasks(prev => ({ ...prev, [projectId]: data.data }));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const toggleProject = (projectId) => {
        const newExpanded = new Set(expandedProjects);
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId);
        } else {
            newExpanded.add(projectId);
            if (!projectTasks[projectId]) {
                fetchProjectTasks(projectId);
            }
        }
        setExpandedProjects(newExpanded);
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '-';

    if (status === "loading" || !session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <FolderKanban className="w-8 h-8 text-blue-600" />
                        Projects
                    </h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Project
                    </button>
                </div>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : projects.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No projects found</td></tr>
                            ) : (
                                projects.map((project) => (
                                    <React.Fragment key={project._id}>
                                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleProject(project._id)}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                                                {expandedProjects.has(project._id) ?
                                                    <ChevronDown className="w-4 h-4" /> :
                                                    <ChevronRight className="w-4 h-4" />
                                                }
                                                {project.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{project.client || '-'}</td>
                                            <td className="px-6 py-4"><StatusBadge status={project.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full"
                                                            style={{ width: `${project.completionPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{project.completionPercent}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{formatDate(project.startDate)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{formatDate(project.endDate)}</td>
                                        </tr>
                                        {expandedProjects.has(project._id) && (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                    <div className="ml-8">
                                                        <h4 className="font-semibold text-sm mb-3">Tasks</h4>
                                                        {projectTasks[project._id] ? (
                                                            <div className="space-y-2">
                                                                {projectTasks[project._id].map(task => (
                                                                    <div key={task._id} className="flex items-center gap-3 text-sm">
                                                                        {task.status === "Completed" ?
                                                                            <Check className="w-4 h-4 text-green-600" /> :
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        }
                                                                        <span className="flex-1">{task.taskName}</span>
                                                                        <StatusBadge status={task.status} />
                                                                        {task.completedBy && (
                                                                            <span className="text-gray-600">by {task.completedBy.name}</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 text-sm">Loading tasks...</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchProjects}
            />
        </div>
    );
}
