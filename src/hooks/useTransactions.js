import { useState, useCallback } from "react";

export function useTransactions() {
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (filters, page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...filters,
        page,
        limit: 50,
      }).toString();

      const res = await fetch(`/api/accounts/transactions?${query}`);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/accounts/transactions?id=${id}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch (error) {
      console.error("Failed to delete transaction", error);
      return false;
    }
  }, []);

  const saveTransaction = useCallback(
    async (transactionData, isEdit = false) => {
      setLoading(true);
      try {
        const method = isEdit ? "PUT" : "POST";
        const payload = { ...transactionData };
        if (isEdit) payload.id = transactionData._id;

        const res = await fetch("/api/accounts/transactions", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        return await res.json();
      } catch (error) {
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    fetchTransactions,
    deleteTransaction,
    saveTransaction,
  };
}
