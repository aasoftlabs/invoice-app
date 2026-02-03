import { useState, useCallback } from "react";

export function useCompany() {
  const [loading, setLoading] = useState(false);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company");
      const data = await res.json();
      return { success: res.ok, data, error: res.ok ? null : data.error };
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
      const res = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      return {
        success: res.ok,
        data,
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
