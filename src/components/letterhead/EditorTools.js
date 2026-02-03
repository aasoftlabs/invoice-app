"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpDown, AlignVerticalJustifyCenter } from "lucide-react";
import { ToolbarDropdown } from "./LetterheadTools";

export const FONT_SIZES = [
  "8px",
  "9px",
  "10px",
  "11px",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "22px",
  "24px",
  "26px",
  "28px",
  "36px",
  "48px",
  "72px",
];
export const LINE_HEIGHTS = ["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"];
export const SPACINGS = ["0px", "10px", "15px", "20px"];

export const FontSizeTool = ({ quillRef, currentFormat }) => {
  const size = currentFormat.size || "11px";
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const changeSize = (direction) => {
    if (!quillRef?.current) return;
    const editor = quillRef.current.getEditor();
    const numericSize = parseInt(size.replace("px", ""), 10) || 11;
    const whitelist = FONT_SIZES.map((s) => parseInt(s.replace("px", ""), 10));

    const currentIndex = whitelist.indexOf(numericSize);
    let newSize = numericSize;

    if (currentIndex === -1) {
      newSize = direction === 1 ? numericSize + 1 : numericSize - 1;
    } else {
      if (direction === 1 && currentIndex < whitelist.length - 1)
        newSize = whitelist[currentIndex + 1];
      if (direction === -1 && currentIndex > 0)
        newSize = whitelist[currentIndex - 1];
    }

    const sizeStr = `${newSize}px`;
    editor.format("size", sizeStr);
  };

  const handleSelect = (val) => {
    if (quillRef?.current) {
      quillRef.current.getEditor().format("size", val);
    }
    setIsOpen(false);
  };

  return (
    <div
      className="flex items-center gap-0 border border-gray-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 h-8 overflow-visible shadow-sm relative"
      ref={wrapperRef}
    >
      <button
        type="button"
        onClick={() => changeSize(-1)}
        className="hover:bg-gray-100 dark:hover:bg-slate-600 h-full px-2 text-gray-500 dark:text-slate-400 font-medium border-r border-gray-100 dark:border-slate-600 rounded-l"
      >
        {" "}
        -{" "}
      </button>
      <div className="relative w-12 h-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 bg-white dark:bg-slate-700"
        >
          {size.replace("px", "")}
        </button>

        {isOpen && (
          <div className="absolute top-full text-center left-1/2 -translate-x-1/2 mt-1 w-16 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
            {FONT_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className={`w-full text-center px-2 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                  size === s
                    ? "bg-blue-50 dark:bg-blue-900/40 font-bold text-blue-700 dark:text-blue-400"
                    : "text-gray-700 dark:text-slate-200"
                }`}
              >
                {s.replace("px", "")}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => changeSize(1)}
        className="hover:bg-gray-100 dark:hover:bg-slate-600 h-full px-2 text-gray-500 dark:text-slate-400 font-medium border-l border-gray-100 dark:border-slate-600 rounded-r"
      >
        {" "}
        +{" "}
      </button>
    </div>
  );
};

export const LineHeightTool = ({ quillRef, currentFormat }) => {
  const val = currentFormat["line-height"] || "";

  const handleSelect = (val) => {
    if (quillRef?.current) {
      quillRef.current.getEditor().format("line-height", val);
    }
  };

  const options = [
    { value: "", label: "Normal" },
    ...LINE_HEIGHTS.map((h) => ({ value: h, label: h })),
  ];

  return (
    <ToolbarDropdown
      value={val}
      options={options}
      onChange={handleSelect}
      icon={ArrowUpDown}
      width="w-10"
      contentWidth="w-24"
    />
  );
};

export const SpacingTool = ({ quillRef, currentFormat }) => {
  const val = currentFormat["spacing"] || "";

  const handleSelect = (val) => {
    if (quillRef?.current) {
      quillRef.current.getEditor().format("spacing", val);
    }
  };

  const options = [
    { value: "", label: "Default" },
    ...SPACINGS.map((s) => ({ value: s, label: s === "0px" ? "None" : s })),
  ];

  return (
    <ToolbarDropdown
      value={val}
      options={options}
      onChange={handleSelect}
      icon={AlignVerticalJustifyCenter}
      width="w-10"
      contentWidth="w-32"
    />
  );
};
