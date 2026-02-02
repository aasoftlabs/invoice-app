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

  const getThemeColor = () => {
    if (pathname.startsWith("/invoices"))
      return "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 shadow-blue-500/20";
    if (pathname.startsWith("/payroll"))
      return "bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 shadow-green-500/20";
    if (pathname.startsWith("/project"))
      return "bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 shadow-purple-500/20";
    if (pathname.startsWith("/letterhead"))
      return "bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-600 shadow-orange-500/20";
    if (pathname.startsWith("/notes"))
      return "bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 shadow-amber-500/20";
    if (pathname.startsWith("/accounts"))
      return "bg-cyan-600 dark:bg-cyan-700 hover:bg-cyan-700 dark:hover:bg-cyan-600 shadow-cyan-500/20";
    if (pathname.startsWith("/users"))
      return "bg-rose-600 dark:bg-rose-700 hover:bg-rose-700 dark:hover:bg-rose-600 shadow-rose-500/20";
    if (pathname.startsWith("/profile"))
      return "bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-indigo-500/20";
    return "bg-slate-700 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 shadow-slate-500/20";
  };

  const themeClasses = getThemeColor();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 z-40 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group flex items-center gap-2 print:hidden ${themeClasses}`}
        title="Add Note / Reminder"
      >
        <StickyNote className="w-6 h-6 text-white" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold">
          Quick Note
        </span>
        <div className="bg-white/20 p-1 rounded-full ml-1 text-white">
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
