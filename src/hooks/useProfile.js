import { useState, useCallback } from "react";

export function useProfile() {
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(async (payload) => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return {
        success: res.ok,
        data,
        error: res.ok ? null : data.error || "Failed to update profile",
      };
    } catch (error) {
      console.error("Failed to update profile", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    updateProfile,
  };
}
