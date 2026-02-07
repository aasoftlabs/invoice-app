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
import { useModal } from "@/contexts/ModalContext";
import NoteModal from "@/components/notes/NoteModal";
import Spotlight from "@/components/ui/Spotlight";
import { useNotes } from "@/hooks/useNotes";

export default function NotesPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  const { confirm } = useModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filter, setFilter] = useState("all"); // all, my, public

  // Use custom hook
  const {
    notes,
    loading: isLoading,
    fetchNotes,
    deleteNote: deleteNoteAPI,
    toggleNoteStatus: toggleNoteStatusAPI,
  } = useNotes();

  // Fetch notes on mount
  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session, fetchNotes]);

  const handleDelete = async (id) => {
    if (
      !(await confirm({
        title: "Delete Note",
        message: "Are you sure you want to delete this note?",
        variant: "danger",
        confirmText: "Delete",
      }))
    )
      return;

    const result = await deleteNoteAPI(id);
    if (result.success) {
      addToast("Note deleted successfully", "success");
      fetchNotes(); // Refresh list
    } else {
      addToast(result.error || "Failed to delete note", "error");
    }
  };

  const handleToggleStatus = async (note) => {
    const result = await toggleNoteStatusAPI(note);
    if (result.success) {
      fetchNotes(); // Refresh list
    } else {
      addToast("Error updating note", "error");
    }
  };

  const filteredNotes = notes.filter((note) => {
    if (filter === "my") return note.createdBy._id === session?.user?.id;
    if (filter === "public") return note.share === "public";
    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <StickyNote className="w-8 h-8 text-blue-600 dark:text-blue-400" />{" "}
              Notes & Reminders
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Keep track of your tasks and meetings
            </p>
          </div>
          <Spotlight
            className="bg-blue-600 dark:bg-blue-700 rounded-xl shadow-lg"
            spotlightColor="rgba(255, 255, 255, 0.25)"
          >
            <button
              onClick={() => {
                setEditingNote(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 flex items-center gap-2 hover:bg-blue-700 dark:hover:bg-blue-600 transition font-bold text-white w-full h-full"
            >
              <Plus className="w-5 h-5" /> Note
            </button>
          </Spotlight>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["all", "my", "public"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? "bg-blue-50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
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
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm animate-pulse h-48"
               />
            ))}
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-slate-600 text-center">
            <StickyNote className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              No notes found
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mt-1">
              Start by creating your first reminder or meeting log.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Spotlight
                key={note._id}
                className={`bg-white dark:bg-slate-800 group rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col cursor-pointer ${
                  note.status === "Completed"
                    ? "opacity-75 bg-gray-50 dark:bg-slate-900"
                    : ""
                }`}
              >
                <div className="p-6 grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      {note.share === "public" ? (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" /> Public
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
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
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                          >
                            <Plus className="w-4 h-4 rotate-45" />{" "}
                            {/* Use Plus as edit/update placeholder */}
                          </button>
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-gray-800 dark:text-slate-200 font-medium mb-4 whitespace-pre-wrap ${note.status === "Completed" ? "line-through" : ""}`}
                  >
                    {note.content}
                  </p>

                  <div className="space-y-2 mt-auto text-xs text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 p-2 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <div>
                        <div className="font-semibold text-gray-700 dark:text-slate-300">
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

                <div className="px-6 py-4 border-t border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/30 rounded-b-2xl">
                  <div className="text-[11px] text-gray-400 dark:text-slate-500">
                    Created by:{" "}
                    <span className="font-semibold">
                      {note.createdBy?.name || "Unknown"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(note)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      note.status === "Completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 shadow-sm"
                    }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${note.status === "Completed" ? "fill-green-700 dark:fill-green-400 text-white dark:text-green-900" : ""}`}
                    />
                    {note.status}
                  </button>
                </div>
              </Spotlight>
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
