"use client";

import React, { useState } from "react";
import { Clock, Globe, User } from "lucide-react";

export default function ActiveNotes({ notes }) {
  if (!notes || notes.length === 0) return null;

  // Duplicate notes for a seamless loop if there are enough to scroll
  const displayNotes = notes.length > 2 ? [...notes, ...notes] : notes;
  const isMarquee = notes.length > 2;

  return (
    <div className="w-full overflow-visible mt-6">
      <div
        className={`${isMarquee ? "animate-marquee" : "flex flex-wrap"} gap-4`}
      >
        {displayNotes.map((note, index) => (
          <NoteBadge key={`${note._id}-${index}`} note={note} />
        ))}
      </div>
    </div>
  );
}

function NoteBadge({ note }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge/Trigger */}
      <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-100 dark:border-blue-900/30 text-sm font-medium text-blue-700 dark:text-blue-400 shadow-sm transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        {note.content.length > 30
          ? note.content.substring(0, 30) + "..."
          : note.content}
      </div>

      {/* Hover Card (Full Details) */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-3 z-[100] w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 p-5 transform transition-all duration-200">
          {/* Arrow */}
          <div className="absolute -top-1.5 left-10 w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-gray-200 dark:border-slate-700 rotate-45"></div>

          <div className="flex justify-between items-start mb-3">
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              <Globe className="w-3 h-3" /> Public Note
            </span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          <p className="text-gray-800 dark:text-slate-200 text-sm font-medium leading-relaxed mb-4 whitespace-pre-wrap">
            {note.content}
          </p>

          <div className="space-y-2 text-[11px] text-gray-500 dark:text-slate-400 border-t border-gray-100 dark:border-slate-700 pt-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>
                {new Date(note.startDateTime).toLocaleString("en-GB", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}{" "}
                -{" "}
                {new Date(note.endDateTime).toLocaleString("en-GB", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>
                By{" "}
                <span className="font-semibold text-gray-700 dark:text-slate-300">
                  {note.createdBy?.name || "Member"}
                </span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
