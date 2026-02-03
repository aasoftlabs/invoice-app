import { useState, useCallback } from "react";

export const useNotes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);

  // Fetch all notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
        return { success: true, data: data.data };
      }
      throw new Error(data.error || "Failed to fetch notes");
    } catch (err) {
      setError(err.message);
      console.error(err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new note
  const createNote = useCallback(async (noteData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      throw new Error(data.error || "Failed to create note");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a note
  const updateNote = useCallback(async (id, noteData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteData),
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, data: data.data };
      }
      throw new Error(data.error || "Failed to update note");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a note
  const deleteNote = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
      throw new Error(data.error || "Failed to delete note");
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle note status
  const toggleNoteStatus = useCallback(
    async (note) => {
      const newStatus = note.status === "Completed" ? "Pending" : "Completed";
      return updateNote(note._id, { status: newStatus });
    },
    [updateNote],
  );

  return {
    loading,
    error,
    notes,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleNoteStatus,
  };
};
