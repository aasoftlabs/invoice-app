import { useState, useCallback } from "react";

export function useInvoices() {
  const [loading, setLoading] = useState(false);

  // Fetch invoices with filters and pagination
  const fetchInvoices = useCallback(
    async (filters = {}, page = 1, limit = 20) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page,
          limit,
          ...filters,
        }).toString();

        const res = await fetch(`/api/invoices?${query}`);
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch invoices", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Fetch unpaid invoices
  const fetchUnpaidInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/invoices/unpaid");
      const data = await res.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error("Failed to fetch unpaid invoices", error);
      return [];
    }
  }, []);

  // Fetch a single invoice by ID
  const fetchInvoiceById = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return { success: false, error: data.error || "Failed to fetch invoice" };
    } catch (error) {
      console.error("Failed to fetch invoice", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new invoice
  const createInvoice = useCallback(async (invoiceData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return {
        success: false,
        error: data.error || "Failed to create invoice",
      };
    } catch (error) {
      console.error("Failed to create invoice", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing invoice
  const updateInvoice = useCallback(async (id, invoiceData) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      return {
        success: false,
        error: data.error || "Failed to update invoice",
      };
    } catch (error) {
      console.error("Failed to update invoice", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete an invoice
  const deleteInvoice = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      return {
        success: false,
        error: data.error || "Failed to delete invoice",
      };
    } catch (error) {
      console.error("Failed to delete invoice", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchInvoices,
    fetchUnpaidInvoices,
    fetchInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
