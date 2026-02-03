"use client";

import { useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// Import constants
import { FONT_SIZES, LINE_HEIGHTS, SPACINGS } from "./EditorTools";

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

export default function LetterheadEditor({ content, setContent, quillRef }) {
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

  // Defensive formatting list - simplified to avoid initialization errors
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "background",
    "align",
    "script",
    "code-block",
    "line-height",
    "spacing",
  ];

  return (
    <div className="ql-editor-container h-full">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        // Removing explicit formats array can sometimes fix "index of null" errors
        // during complex state updates as it defaults to all registered formats.
        className="h-full border-none"
        placeholder="Start typing your official document here..."
      />
    </div>
  );
}
