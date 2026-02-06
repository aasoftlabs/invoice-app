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
          height: "100%",
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
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "table | removeformat",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; margin: 1rem; }",
          resize: false,
          statusbar: false,
          fixed_toolbar_container: "#editor-toolbar",
          inline: true,
        }}
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
      />
    </div>
  );
}
