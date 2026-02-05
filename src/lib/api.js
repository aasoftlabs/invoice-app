/**
 * Centralized API service for handling data fetching and mutation.
 * This pattern allows for easier error handling, typing, and testing.
 */

// Helper to handle response parsing and errors
async function fetchHelper(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const api = {
  // Invoices
  invoices: {
    getNextNumber: () => fetchHelper("/api/invoices/next"),
    getById: (id) => fetchHelper(`/api/invoices/${id}`),
    create: (data) =>
      fetchHelper("/api/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      fetchHelper(`/api/invoices/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      fetchHelper(`/api/invoices/${id}`, {
        method: "DELETE",
      }),
  },

  // Company / Setup
  setup: {
    getProfile: () => fetchHelper("/api/profile"),
    updateProfile: (data) =>
      fetchHelper("/api/profile", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Payroll
  payroll: {
    getSlip: (id) => fetchHelper(`/api/payroll/slips/${id}`),
    createSlip: (data) =>
      fetchHelper("/api/payroll/create", {
        // Assuming this endpoint based on context
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
};
