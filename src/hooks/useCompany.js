import { useState, useCallback } from "react";

export function useCompany() {
  const [loading, setLoading] = useState(false);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup");
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          profile: data.profile,
          userCount: data.userCount,
        };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error("Failed to fetch company", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback(async (formData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      return {
        success: res.ok,
        data: data.profile,
        error: res.ok
          ? null
          : data.error || "Failed to update company settings",
      };
    } catch (error) {
      console.error("Failed to update company", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchCompany,
    updateCompany,
  };
}
