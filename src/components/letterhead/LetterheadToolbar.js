"use client";

import { useState, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table as TableIcon,
} from "lucide-react";
import { ToolbarButton, ToolbarDropdown } from "./LetterheadTools";
import { FontSizeTool, LineHeightTool, SpacingTool } from "./EditorTools";

export default function CustomToolbar({
  zoom,
  zoomIn,
  zoomOut,
  resetZoom,
  quillRef,
}) {
  const [currentFormat, setCurrentFormat] = useState({});

  useEffect(() => {
    if (!quillRef?.current) return;
    const editor = quillRef.current.getEditor();

    const handleChange = (range) => {
      // Defensive check: range can be null if editor loses focus
      try {
        if (range) {
          const formats = editor.getFormat(range);
          setCurrentFormat(formats || {});
        } else {
          // If no selection, we can still show formats at current cursor or 0
          const formats = editor.getFormat(editor.getSelection() || 0);
          setCurrentFormat(formats || {});
        }
      } catch (err) {
        console.warn("Quill format update failed:", err);
      }
    };

    editor.on("selection-change", handleChange);
    // For text changes, we usually want to re-check formats at new position
    const handleTextChange = () => {
      try {
        const formats = editor.getFormat();
        setCurrentFormat(formats || {});
      } catch (err) {
        // ignore
      }
    };
    editor.on("text-change", handleTextChange);

    return () => {
      editor.off("selection-change", handleChange);
      editor.off("text-change", handleTextChange);
    };
  }, [quillRef]);

  const handleFormat = (format, value) => {
    if (quillRef?.current) {
      quillRef.current.getEditor().format(format, value);
    }
  };

  const toggleFormat = (format) => {
    if (quillRef?.current) {
      const currentValue = currentFormat[format];
      quillRef.current.getEditor().format(format, !currentValue);
    }
  };

  const insertTable = () => {
    if (quillRef?.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      if (range) {
        const tableHTML =
          '<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;"><tbody><tr><td style="border: 1px solid #ccc; padding: 8px;">Cell 1</td><td style="border: 1px solid #ccc; padding: 8px;">Cell 2</td></tr><tr><td style="border: 1px solid #ccc; padding: 8px;">Cell 3</td><td style="border: 1px solid #ccc; padding: 8px;">Cell 4</td></tr></tbody></table>';
        editor.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
      }
    }
  };

  const fontOptions = [
    { value: "", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
    { value: "monospace", label: "Monospace" },
  ];

  const headerOptions = [
    { value: "", label: "Normal" },
    { value: "1", label: "Heading 1" },
    { value: "2", label: "Heading 2" },
    { value: "3", label: "Heading 3" },
  ];

  return (
    <div id="toolbar" className="flex flex-col gap-4">
      {/* Edit & Zoom Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-center">
          Edit & Zoom
        </span>
        <div className="flex flex-wrap justify-between gap-1 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-200 dark:border-slate-600">
          <div className="flex gap-1 ql-formats">
            <button className="ql-undo p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
              <svg viewBox="0 0 18 18" className="dark:text-slate-300">
                <polygon
                  className="ql-fill ql-stroke"
                  points="6 10 4 12 2 10 6 10"
                ></polygon>
                <path
                  className="ql-stroke"
                  d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
                ></path>
              </svg>
            </button>
            <button className="ql-redo p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
              <svg viewBox="0 0 18 18" className="dark:text-slate-300">
                <polygon
                  className="ql-fill ql-stroke"
                  points="12 10 14 12 16 10 12 10"
                ></polygon>
                <path
                  className="ql-stroke"
                  d="M9.91,13.91A4.6,4.6,0,0,1,9,14,5,5,0,1,1,5-5"
                ></path>
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-1 border-l pl-2 border-gray-300 dark:border-slate-600">
            <button
              type="button"
              onClick={zoomOut}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
            >
              <ZoomOut className="w-3 h-3 text-gray-600 dark:text-slate-400" />
            </button>
            <span className="text-[10px] font-mono w-8 text-center dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
            >
              <ZoomIn className="w-3 h-3 text-gray-600 dark:text-slate-400" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
            >
              <RotateCcw className="w-3 h-3 text-gray-400 dark:text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Typography Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-center">
          Typography
        </span>
        <div className="flex flex-nowrap justify-center gap-1 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-200 dark:border-slate-600 items-center">
          <ToolbarDropdown
            value={currentFormat.font || ""}
            options={fontOptions}
            onChange={(val) => handleFormat("font", val)}
            width="w-40"
            placeholder="Font"
            className="mr-1"
          />
          <div className="mr-1">
            <FontSizeTool quillRef={quillRef} currentFormat={currentFormat} />
          </div>
          <ToolbarDropdown
            value={currentFormat.header || ""}
            options={headerOptions}
            onChange={(val) => handleFormat("header", val)}
            width="w-32"
            placeholder="Style"
          />
        </div>
      </div>

      {/* Style Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-center">
          Style
        </span>
        <div className="flex flex-wrap justify-center gap-1 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-200 dark:border-slate-600">
          <ToolbarButton
            onClick={() => toggleFormat("bold")}
            isActive={currentFormat.bold}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleFormat("italic")}
            isActive={currentFormat.italic}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleFormat("underline")}
            isActive={currentFormat.underline}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => toggleFormat("strike")}
            isActive={currentFormat.strike}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <div className="ql-formats flex items-center h-8">
            <select className="ql-color h-8 w-8"></select>
            <select className="ql-background h-8 w-8"></select>
          </div>
        </div>
      </div>

      {/* Paragraph Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-center">
          Paragraph
        </span>
        <div className="flex flex-wrap justify-center gap-1 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-200 dark:border-slate-600 items-center">
          <div className="flex items-center gap-0.5 border-r pr-2 border-gray-300 dark:border-slate-600 mr-2">
            <ToolbarButton
              onClick={() => handleFormat("align", "")}
              isActive={!currentFormat.align}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => handleFormat("align", "center")}
              isActive={currentFormat.align === "center"}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => handleFormat("align", "right")}
              isActive={currentFormat.align === "right"}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => handleFormat("align", "justify")}
              isActive={currentFormat.align === "justify"}
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </ToolbarButton>
          </div>
          <div className="ql-formats flex gap-0.5 mr-2">
            <button
              className="ql-list p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              value="ordered"
            ></button>
            <button
              className="ql-list p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              value="bullet"
            ></button>
          </div>
          <div className="ql-formats flex gap-0.5 mr-2 border-l pl-2 border-gray-300 dark:border-slate-600">
            <button
              className="ql-indent p-1 hover:bg-gray-200 rounded"
              value="-1"
            ></button>
            <button
              className="ql-indent p-1 hover:bg-gray-200 rounded"
              value="+1"
            ></button>
          </div>
          <div className="flex gap-1 border-l pl-2 border-gray-300">
            <LineHeightTool quillRef={quillRef} currentFormat={currentFormat} />
            <SpacingTool quillRef={quillRef} currentFormat={currentFormat} />
          </div>
        </div>
      </div>

      {/* Insert Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider text-center">
          Insert
        </span>
        <div className="flex flex-wrap justify-center gap-1 bg-gray-50 dark:bg-slate-700/50 p-2 rounded border border-gray-200 dark:border-slate-600 ql-formats">
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          <ToolbarButton onClick={insertTable} title="Insert Table">
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>
          <button className="ql-script" value="sub"></button>
          <button className="ql-script" value="super"></button>
          <button className="ql-blockquote"></button>
          <button className="ql-code-block"></button>
          <button className="ql-clean"></button>
        </div>
      </div>
    </div>
  );
}
