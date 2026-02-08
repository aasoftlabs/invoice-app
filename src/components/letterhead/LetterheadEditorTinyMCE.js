"use client";

import { Editor } from "@tinymce/tinymce-react";

export default function LetterheadEditorTinyMCE({ content, setContent }) {
  return (
    <div className="h-full">
      <Editor
        id="letterhead-editor"
        value={content}
        onEditorChange={(newValue) => setContent(newValue)}
        init={{
          menubar: "file edit view insert format tools table",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "wordcount",
            "autoresize",
            "pagebreak",
            "visualchars",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "table | removeformat",
          toolbar_mode: "sliding",
          mobile: {
            menubar: true,
            toolbar_mode: "sliding",
          },
          content_style:
            "body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 0; color: #000; padding: 10px; } p { margin-bottom: 1em; }",
          resize: false,
          statusbar: false,
          fixed_toolbar_container: "#editor-toolbar",
          inline: true,
          auto_focus: "letterhead-editor",
          paste_data_images: true,
          paste_as_text: false,
          paste_remove_styles_if_webkit: false,
          convert_urls: false,
          min_height: 400,
          placeholder: "Click here to start typing your letter...",
        }}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      />
    </div>
  );
}
