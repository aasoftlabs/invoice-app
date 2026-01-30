"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  Upload,
  Printer,
  ChevronLeft,
  ChevronRight,
  Menu,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowUpDown,
  AlignVerticalJustifyCenter,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link,
  Image,
  Subscript,
  Superscript,
  Quote,
  Code,
  Eraser,
  Table as TableIcon,
} from "lucide-react";
import BrandName from "@/components/BrandName";
import dynamic from "next/dynamic";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

// Constants for Whitelists (Shared between Quill registry and UI)
const FONT_SIZES = [
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
const LINE_HEIGHTS = ["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"];
const SPACINGS = ["0px", "10px", "15px", "20px"];

// Register Quill Modules safely on Client Side
if (typeof window !== "undefined") {
  try {
    const { Quill } = require("react-quill-new");
    if (Quill) {
      // Font Size
      const Size = Quill.import("attributors/style/size");
      Size.whitelist = FONT_SIZES;
      Quill.register(Size, true);

      // Line Height & Spacing (using Parchment)
      // Fix: creating attributes based on existing class constructor if Parchment access fails
      const Parchment = Quill.import("parchment");
      const StyleAttributor = Parchment.Attributor?.Style || Size.constructor;
      const Scope = Parchment.Scope || { BLOCK: 2, INLINE: 1 };

      const LineHeightStyle = new StyleAttributor(
        "line-height",
        "line-height",
        { scope: Scope.BLOCK },
      );
      LineHeightStyle.whitelist = LINE_HEIGHTS;
      Quill.register(LineHeightStyle, true);

      const SpacingStyle = new StyleAttributor("spacing", "margin-bottom", {
        scope: Scope.BLOCK,
      });
      SpacingStyle.whitelist = SPACINGS;
      Quill.register(SpacingStyle, true);
    }
  } catch (e) {
    console.error("Error registering Quill modules:", e);
  }
}

// Reusable Button Component for Toolbar
const ToolbarButton = ({
  onClick,
  isActive,
  children,
  title,
  className = "",
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-md transition-all flex items-center justify-center min-w-[32px] h-8 border shadow-sm ${isActive ? "bg-blue-50 text-blue-600 border-blue-200 font-semibold" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"} ${className}`}
  >
    {children}
  </button>
);

// Reusable Custom Dropdown Component to avoid Quill hijacking native selects
const ToolbarDropdown = ({
  value,
  options,
  onChange,
  icon: Icon,
  placeholder,
  width = "w-24",
  contentWidth,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const selectedLabel =
    options.find((o) => o.value == value)?.label || placeholder || value;

  return (
    <div className={`relative h-8 ${width} ${className}`} ref={wrapperRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex! items-center! justify-between! px-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 hover:border-gray-300 text-xs font-medium text-gray-700 transition-all gap-1! cursor-pointer"
        title={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
      >
        {Icon ? (
          <div className="flex items-center justify-center w-full">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
        ) : (
          <>
            <span className="truncate grow text-left">{selectedLabel}</span>
            <ChevronDown
              className={`w-3 h-3 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 ${contentWidth || "w-max min-w-full"} bg-white border border-gray-200 rounded-md shadow-lg z-100 max-h-48 overflow-y-auto flex flex-col`}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs whitespace-nowrap hover:bg-blue-50 transition-colors flex items-center justify-between ${value === opt.value ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
            >
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FontSizeTool = ({ quillRef, currentFormat }) => {
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
      className="flex items-center gap-0 border border-gray-200 rounded-md bg-white h-8 overflow-visible shadow-sm relative"
      ref={wrapperRef}
    >
      <button
        type="button"
        onClick={() => changeSize(-1)}
        className="hover:bg-gray-100 h-full px-2 text-gray-500 font-medium border-r border-gray-100 rounded-l"
      >
        {" "}
        -{" "}
      </button>
      <div className="relative w-12 h-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white"
        >
          {size.replace("px", "")}
        </button>

        {isOpen && (
          <div className="absolute top-full text-center left-1/2 -translate-x-1/2 mt-1 w-16 bg-white border border-gray-200 rounded shadow-lg z-100 max-h-48 overflow-y-auto">
            {FONT_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className={`w-full text-center px-2 py-1.5 text-xs hover:bg-blue-50 ${size === s ? "bg-blue-50 font-bold" : ""}`}
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
        className="hover:bg-gray-100 h-full px-2 text-gray-500 font-medium border-l border-gray-100 rounded-r"
      >
        {" "}
        +{" "}
      </button>
    </div>
  );
};

const LineHeightTool = ({ quillRef, currentFormat }) => {
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

const SpacingTool = ({ quillRef, currentFormat }) => {
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

const CustomToolbar = ({ zoom, zoomIn, zoomOut, resetZoom, quillRef }) => {
  // Track selection formats to update UI state
  const [currentFormat, setCurrentFormat] = useState({});

  useMemo(() => {
    if (!quillRef?.current) return;
    const editor = quillRef.current.getEditor();
    // Handler for update
    const handleChange = () => {
      const formats = editor.getFormat();
      setCurrentFormat(formats);
    };

    editor.on("selection-change", handleChange);
    // Also listen to text-change to update UI if necessary (e.g. cursor moves)
    editor.on("text-change", handleChange);

    return () => {
      editor.off("selection-change", handleChange);
      editor.off("text-change", handleChange);
    };
  }, [quillRef]);

  const handleFormat = (format, value) => {
    if (quillRef?.current) {
      quillRef.current.getEditor().format(format, value);
    }
  };

  // Helper for boolean toggles
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
    <div id="toolbar" className="flex flex-col gap-4 ">
      {/* History / Edit / Zoom Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          Edit & Zoom
        </span>
        <div className="flex flex-wrap justify-between gap-1 bg-gray-50 p-2 rounded border border-gray-200">
          <div className="flex gap-1">
            <button className="ql-undo p-1 hover:bg-gray-200 rounded">
              <svg viewBox="0 0 18 18">
                {" "}
                <polygon
                  className="ql-fill ql-stroke"
                  points="6 10 4 12 2 10 6 10"
                ></polygon>{" "}
                <path
                  className="ql-stroke"
                  d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
                ></path>{" "}
              </svg>
            </button>
            <button className="ql-redo p-1 hover:bg-gray-200 rounded">
              <svg viewBox="0 0 18 18">
                {" "}
                <polygon
                  className="ql-fill ql-stroke"
                  points="12 10 14 12 16 10 12 10"
                ></polygon>{" "}
                <path
                  className="ql-stroke"
                  d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
                ></path>{" "}
              </svg>
            </button>
          </div>
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border-l pl-2 border-gray-300">
            <button
              type="button"
              onClick={zoomOut}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ZoomOut className="w-3 h-3 text-gray-600" />
            </button>
            <span className="text-[10px] font-mono w-8 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ZoomIn className="w-3 h-3 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <RotateCcw className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Typography Section (Dropdowns & Buttons) */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          Typography
        </span>
        <div className="flex flex-nowrap justify-center gap-1 bg-gray-50 p-2 rounded border border-gray-200 items-center">
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
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          Style
        </span>
        <div className="flex flex-wrap justify-center gap-1 bg-gray-50 p-2 rounded border border-gray-200">
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

          {/* Keep native color pickers for now as they are complex to replicate quickly, but wrap them for layout consistency if needed.
                        Actually, just render them. They might look odd next to custom buttons.
                        Ideally valid html select with ql-color works, but user asked for "button look".
                        Since color picker is a popup, let's leave it as standard Quill for now unless user complains about specific Color tool.
                    */}
          <select className="ql-color h-8 w-8"></select>
          <select className="ql-background h-8 w-8"></select>
        </div>
      </div>

      {/* Paragraph Section (Unpacked Align & Lists) */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          Paragraph
        </span>
        <div className="flex flex-wrap justify-center gap-1 bg-gray-50 p-2 rounded border border-gray-200 items-center">
          {/* Alignment Buttons */}
          <div className="flex items-center gap-0.5 border-r pr-2 border-gray-300 mr-2">
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

          <div className="flex gap-0.5 mr-2">
            <button
              className="ql-list p-1 hover:bg-gray-200 rounded"
              value="ordered"
            ></button>
            <button
              className="ql-list p-1 hover:bg-gray-200 rounded"
              value="bullet"
            ></button>
          </div>

          <div className="flex gap-0.5 mr-2 border-l pl-2 border-gray-300">
            <button
              className="ql-indent p-1 hover:bg-gray-200 rounded"
              value="-1"
            ></button>
            <button
              className="ql-indent p-1 hover:bg-gray-200 rounded"
              value="+1"
            ></button>
          </div>

          {/* Custom Line Height & Spacing Controls */}
          <div className="flex gap-1 border-l pl-2 border-gray-300">
            <LineHeightTool quillRef={quillRef} currentFormat={currentFormat} />
            <SpacingTool quillRef={quillRef} currentFormat={currentFormat} />
          </div>
        </div>
      </div>

      {/* Insert Section */}
      <div className="flex flex-col gap-1 w-full">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
          Insert
        </span>
        <div className="flex flex-wrap justify-center gap-1 bg-gray-50 p-2 rounded border border-gray-200">
          <button className="ql-link"></button>
          <button className="ql-image"></button>
          {/* Image handler handles simple base64 insertion by default */}
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
};

export default function LetterheadView({ profile }) {
  const [content, setContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1); // 1 = 100%
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);

  const handlePrint = () => {
    const previousZoom = zoom;
    setZoom(1);
    // Small timeout to allow render to update before print dialog opens
    setTimeout(() => {
      window.print();
      setZoom(previousZoom);
    }, 100);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#toolbar",
        handlers: {},
      },
      clipboard: {
        matchVisual: false,
        matchers: [
          [
            3,
            (node, delta) => {
              // 3 = Node.TEXT_NODE constant (avoiding SSR issues)
              delta.ops = delta.ops.map((op) => {
                return {
                  insert: op.insert.replace(/  +/g, (match) =>
                    "\u00A0".repeat(match.length),
                  ),
                };
              });
              return delta;
            },
          ],
        ],
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
    }),
    [],
  );

  // Zoom Controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white text-gray-900 font-sans relative transition-all duration-300">
      {/* Sidebar Toggle Button - Always Visible (unless print) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-24 z-60 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 text-gray-600 transition-all print:hidden ${isSidebarOpen ? "left-[430px]" : "left-8"}`}
        title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Left Sidebar Controls - Fixed */}
      <div
        className={`fixed left-0 top-[90px] h-[80vh] bg-gray-50/50 backdrop-blur-sm z-50 p-5 w-[460px] transition-transform duration-300 ease-in-out print:hidden flex flex-col gap-4 border-r border-gray-200 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Scrollable Container for controls */}
        <div className="pb-10 flex flex-col gap-6">
          {/* Controls */}
          <div>
            {/* Top Controls Row */}
            <div className="flex flex-row justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 px-2">
                Letterhead
              </h1>
              <button
                onClick={handlePrint}
                className="flex-0 flex items-center mx-4 justify-center gap-2 px-4 py-2 hover:cursor-pointer bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm transition"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>

          {/* Custom Toolbar */}
          <div>
            <CustomToolbar
              zoom={zoom}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              resetZoom={resetZoom}
              quillRef={quillRef}
            />
          </div>
        </div>
      </div>

      {/* A4 Paper Preview Container with Zoom */}
      <div
        className={`transition-all duration-300 flex justify-center origin-top top-0 relative print:ml-0! print:w-full! print:mx-auto! print:left-0! ${isSidebarOpen ? "ml-[470px]" : "mx-auto"}`}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          // Adjust height to accommodate zoom if needed, but standard flow works well usually
          marginBottom: `${(zoom - 1) * 300}px`, // rudimentary spacing fix
        }}
      >
        <div className="max-w-[210mm] w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none print:m-0 flex flex-col px-12 py-10 relative box-border">
          {/* Header / Letterhead Top */}
          <header className="flex justify-between items-start border-b-2 border-blue-500 pb-2 mb-5">
            <div className="flex items-center gap-4 mb-2">
              {profile.logo ? (
                <img
                  src={profile.logo}
                  className="h-16 w-auto object-contain max-w-[150px]"
                  alt="Logo"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                  Logo
                </div>
              )}
              <div>
                <BrandName
                  name={profile.name}
                  color={profile.formatting?.color}
                />
                {profile.slogan && (
                  <div className="text-[8px] text-gray-500 uppercase mt-1">
                    {profile.slogan}
                  </div>
                )}
                {profile.tagline && (
                  <div
                    className="text-[10px] uppercase font-bold mt-1"
                    style={{ color: profile.formatting?.color || "#1d4ed8" }}
                  >
                    {profile.tagline}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 leading-relaxed">
              {/* Contact Block */}
              <div className="mb-3">
                <span
                  className="uppercase"
                  style={{
                    color: profile.formatting?.color,
                    fontWeight: "bold",
                  }}
                >
                  Contact Us
                </span>
                {profile?.phone && (
                  <p>
                    <span>+91 </span> {profile.phone}
                  </p>
                )}
                {profile?.email && <p>{profile.email}</p>}
              </div>
            </div>
          </header>

          {/* Content Area - Rich Text Editor */}
          <div className="grow relative group min-h-[850px]">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="h-full"
              placeholder="Type your document content here..."
            />
          </div>

          {/* Footer with Company Details */}
          <footer className="mt-auto pt-2 border-t-2 border-blue-500 text-xs text-gray-500 text-center">
            <div className="flex justify-between gap-40 mb-2 text-left">
              {/* Registered Office */}
              <div>
                <h4
                  className="font-bold uppercase text-gray-800 mb-1"
                  style={{ color: profile.formatting?.color }}
                >
                  Registered Office
                </h4>
                <p className="whitespace-pre-line leading-relaxed">
                  {profile?.address}
                </p>
              </div>
              {/* Registration Details */}
              <div>
                <h4
                  className="font-bold uppercase text-gray-800 mb-1"
                  style={{ color: profile.formatting?.color }}
                >
                  Registration
                </h4>
                {profile?.registrationNo && (
                  <p>
                    <span className="font-medium">{`${profile?.registrationType} No:`}</span>{" "}
                    {profile?.registrationNo}
                  </p>
                )}
                {profile?.gstIn && (
                  <p>
                    <span className="font-medium">GSTIN:</span> {profile?.gstIn}
                  </p>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>

      <style jsx global>{`
        /* Hide toolbar when printing */
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white;
          }
          /* Since toolbar is outside the print area, we just need to hide the fixed sidebar */
          /* But we rely on print:hidden classes on the sidebar container */

          /* Ensure content prints correctly */
          .ql-editor {
            padding: 0;
            overflow: visible;
            min-height: auto;
          }
        }

        /* Custom styles to blend editor */
        .ql-container.ql-snow {
          border: none;
          font-size: 11pt; /* Document standard */
        }

        /* Editor Content */
        .ql-editor {
          min-height: 500px;
          font-family: inherit;
        }

        /* Custom icons for Undo/Redo if needed */
        .ql-undo svg,
        .ql-redo svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
