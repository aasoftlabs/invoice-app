import { useState, useCallback } from "react";

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data States
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [stats, setStats] = useState(null);

  // --- Projects ---

  const fetchProjects = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          filters.page > 1 ? [...prev, ...data.data] : data.data,
        );
        return data; // Return full object for pagination
      } else {
        throw new Error(data.error || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) return { success: true };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Tasks ---

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      if (data.success) {
        setTasks((prev) =>
          filters.page > 1 ? [...prev, ...data.data] : data.data,
        );
        return data; // Return full data object for pagination info if needed
      }
      return { data: [] };
    } catch (err) {
      console.error(err);
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    try {
      // Clean up empty assignedTo if present
      const submitData = { ...taskData };
      if (!submitData.assignedTo) delete submitData.assignedTo;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (data.success) return { success: true, data: data.data };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (taskData) => {
    setLoading(true);
    try {
      const submitData = { ...taskData };
      if (!submitData.assignedTo) delete submitData.assignedTo;

      const res = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (data.success) return { success: true, data: data.data };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) return { success: true };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Work Logs ---

  const fetchWorkLogs = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Explicitly map supported filters like in component
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const res = await fetch(`/api/worklogs?${params}`);
      const data = await res.json();
      if (data.success) {
        setWorkLogs((prev) =>
          filters.page > 1 ? [...prev, ...data.data] : data.data,
        );
        return data;
      }
      return { data: [] };
    } catch (err) {
      console.error(err);
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkLog = useCallback(async (logData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/worklogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
      const data = await res.json();
      if (data.success) return { success: true };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorkLog = useCallback(async (id, logData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/worklogs?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
      const data = await res.json();
      if (data.success) return { success: true };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWorkLog = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/worklogs?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) return { success: true };
      return { success: false, error: data.error };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Dashboard Stats ---

  const fetchDashboardStats = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.userId) params.append("userId", filters.userId);

      const res = await fetch(`/api/dashboard/stats?${params}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
        return data.data;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Projects
    projects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    // Tasks
    tasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    // Work Logs
    workLogs,
    fetchWorkLogs,
    createWorkLog,
    updateWorkLog,
    deleteWorkLog,
    // Stats
    stats,
    fetchDashboardStats,
  };
};
