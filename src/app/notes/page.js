"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  StickyNote,
  Lock,
  Globe,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/contexts/ToastContext";
import NoteModal from "@/components/notes/NoteModal";

export default function NotesPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState("all"); // all, my, public

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      addToast("Failed to fetch notes", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session, fetchNotes]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        addToast("Note deleted successfully", "success");
        fetchNotes();
      } else {
        addToast(data.error || "Failed to delete note", "error");
      }
    } catch (error) {
      addToast("Error deleting note", "error");
    }
  };

  const handleToggleStatus = async (note) => {
    const newStatus = note.status === "Completed" ? "Pending" : "Completed";
    try {
      const res = await fetch(`/api/notes/${note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchNotes();
      }
    } catch (error) {
      addToast("Error updating note", "error");
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (filter === "my") return note.createdBy._id === session?.user?.id;
    if (filter === "public") return note.share === "public";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <StickyNote className="w-8 h-8 text-blue-600" /> Notes & Reminders
            </h1>
            <p className="text-gray-500 mt-1">
              Keep track of your tasks and meetings
            </p>
          </div>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition shadow-lg font-bold"
          >
            <Plus className="w-5 h-5" /> Note
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "my", "public"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-blue-100 text-blue-700 ring-1 ring-blue-700"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {f === "all"
                ? "All Notes"
                : f === "my"
                  ? "My Notes"
                  : "Public Notes"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-48"
              ></div>
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
            <StickyNote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800">No notes found</h3>
            <p className="text-gray-500 mt-1">
              Start by creating your first reminder or meeting log.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                className={`bg-white group rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col ${
                  note.status === "Completed" ? "opacity-75 bg-gray-50" : ""
                }`}
              >
                <div className="p-6 grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {note.share === "public" ? (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(session?.user?.id === note.createdBy?._id ||
                        session?.user?.role === "admin") && (
                        <>
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Plus className="w-4 h-4 rotate-45" />{" "}
                            {/* Use Plus as edit/update placeholder */}
                          </button>
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-gray-800 font-medium mb-4 whitespace-pre-wrap ${note.status === "Completed" ? "line-through" : ""}`}
                  >
                    {note.content}
                  </p>

                  <div className="space-y-2 mt-auto text-xs text-gray-500">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <div>
                        <div className="font-semibold text-gray-700">
                          Schedule
                        </div>
                        <div>
                          {new Date(note.startDateTime).toLocaleString(
                            "en-GB",
                            { dateStyle: "short", timeStyle: "short" },
                          )}{" "}
                          -{" "}
                          {new Date(note.endDateTime).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/50 rounded-b-2xl">
                  <div className="text-[11px] text-gray-400">
                    Created by:{" "}
                    <span className="font-semibold">
                      {note.createdBy?.name || "Unknown"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(note)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      note.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${note.status === "Completed" ? "fill-green-700 text-white" : ""}`}
                    />
                    {note.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <NoteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchNotes();
          }}
          initialData={editingNote}
        />
      </div>
    </div>
  );
}
