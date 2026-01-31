"use client";

import { useState } from "react";
import { StickyNote, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import NoteModal from "./NoteModal";

export default function GlobalNoteButton() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show on login, setup, or verify pages
  if (
    !session ||
    pathname === "/login" ||
    pathname === "/setup" ||
    pathname.startsWith("/verify")
  ) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all group flex items-center gap-2 print:hidden"
        title="Add Note / Reminder"
      >
        <StickyNote className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold">
          Quick Note
        </span>
        <div className="bg-white/20 p-1 rounded-full ml-1">
          <Plus className="w-4 h-4" />
        </div>
      </button>

      <NoteModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setIsOpen(false)}
        initialData={null}
      />
    </>
  );
}
