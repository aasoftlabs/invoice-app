"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import Spotlight from "@/components/ui/Spotlight";
import LetterheadEditorTinyMCE from "@/components/letterhead/LetterheadEditorTinyMCE";
import BrandName from "@/components/BrandName";
import PermissionGate from "@/components/ui/PermissionGate";

export default function LetterheadView({ profile }) {
  const [content, setContent] = useState("");

  const [zoom, setZoom] = useState(1); // 1 = 100%
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrint = () => {
    const previousZoom = zoom;
    setZoom(1);
    // Small timeout to allow render to update before print dialog opens
    setTimeout(() => {
      window.print();
      setZoom(previousZoom);
    }, 100);
  };

  // Zoom Controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <PermissionGate permission="letterhead">
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-slate-900 print:bg-white text-gray-900 dark:text-slate-200 font-sans transition-all duration-300">
        {/* Top Navigation Bar / Toolbar Area */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm print:hidden">
          <div className="flex items-center justify-between px-4 h-20">
            {/* TinyMCE will teleport its toolbar here via fixed_toolbar_container: '#editor-toolbar' */}
            <div
              id="editor-toolbar"
              className="flex-1 mr-4 h-full relative"
            ></div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 min-w-[200px] justify-end">
              {/* Zoom Controls */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1 mr-2">
                <button
                  onClick={zoomOut}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md text-gray-600 dark:text-gray-300"
                  title="Zoom Out"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90" />{" "}
                  {/* Reuse chevron for cleaner bundle if needed or use proper icons */}
                </button>
                <span className="text-xs font-mono w-12 text-center text-gray-600 dark:text-gray-300">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md text-gray-600 dark:text-gray-300"
                  title="Zoom In"
                >
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>

              <Spotlight
                className="bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                spotlightColor="rgba(255, 255, 255, 0.25)"
              >
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium transition"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              </Spotlight>
            </div>
          </div>
        </header>

        {/* Main Workspace - Centered A4 Page */}
        <div className="flex-1 overflow-auto p-8 relative flex justify-center bg-gray-100 dark:bg-slate-900 print:p-0 print:bg-white">
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center"
            style={{
              transform: `scale(${zoom})`,
              marginBottom: `${(zoom - 1) * 300}px`, // Compensate spacing when zoomed in
            }}
          >
            <div className="max-w-[210mm] w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none print:w-full print:max-w-none print:m-0 flex flex-col px-12 py-10 relative box-border">
              {/* Header / Letterhead Top */}
              <header className="flex justify-between items-start border-b-2 border-blue-500 pb-2 mb-5">
                <div className="flex items-center gap-4 mb-2">
                  {profile?.logo ? (
                    <NextImage
                      src={profile.logo}
                      width={150}
                      height={64}
                      unoptimized
                      className="h-16 w-auto object-contain max-w-[150px]"
                      alt="Logo"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-gray-400">
                      No Logo
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
                        style={{
                          color: profile.formatting?.color || "#1d4ed8",
                        }}
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
                      className="uppercase font-bold"
                      style={{
                        color: profile.formatting?.color,
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

              {/* Document Content Area */}
              <main className="flex-1 relative">
                {isMounted && (
                  <LetterheadEditorTinyMCE
                    content={content}
                    setContent={setContent}
                  />
                )}
              </main>

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
                        <span className="font-medium">GSTIN:</span>{" "}
                        {profile?.gstIn}
                      </p>
                    )}
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>

        <style jsx global>{`
          /* TinyMCE specific overrides to make the toolbar blend in */
          /* TinyMCE specific overrides to make the toolbar blend in */
          .tox-tinymce {
            border: none !important;
            height: 100% !important;
          }
          /* Ensure the editor header (if it tries to render) is hidden/transparent since we use fixed toolbar */
          .tox-editor-header {
            background: transparent !important;
            box-shadow: none !important;
          }

          /* Custom styling for the fixed toolbar container */
          /* Custom styling for the fixed toolbar container */
          /* Custom styling for the fixed toolbar container */
          #editor-toolbar .tox-tinymce {
            border: none !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            background: transparent !important;
          }

          /* AGGRESSIVE transparency for all toolbar elements including buttons */
          #editor-toolbar .tox-editor-header,
          #editor-toolbar .tox-menubar,
          #editor-toolbar .tox-toolbar-overlord,
          #editor-toolbar .tox-toolbar__primary,
          #editor-toolbar .tox-toolbar__group,
          #editor-toolbar .tox-mbtn,
          #editor-toolbar .tox-tbtn,
          #editor-toolbar .tox-split-button {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Fix text and icon colors for dark mode context */
          #editor-toolbar .tox-mbtn__select-label,
          #editor-toolbar .tox-tbtn__select-label,
          #editor-toolbar .tox-tbtn svg,
          #editor-toolbar .tox-mbtn {
            color: inherit !important;
            fill: currentColor !important;
          }

          /* Dark mode specific - ensure text is light if header is dark */
          /* Assuming parent header is dark:bg-slate-800 which implies light text */
          :global(.dark) #editor-toolbar {
            color: #e2e8f0; /* slate-200 */
            --tox-color: #e2e8f0;
          }

          /* Hover effects */
          #editor-toolbar .tox-mbtn:hover,
          #editor-toolbar .tox-tbtn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
          }

          /* Dark Mode Text & Icon Colors */
          /* Note: We use :global(.dark) or just .dark if this is global jsx */
          :global(.dark) #editor-toolbar .tox-mbtn__select-label,
          :global(.dark) #editor-toolbar .tox-tbtn__select-label,
          :global(.dark) #editor-toolbar .tox-tbtn svg,
          :global(.dark) #editor-toolbar .tox-mbtn {
            color: #e2e8f0 !important; /* slate-200 */
            fill: #e2e8f0 !important;
          }

          /* Hover states for dark mode */
          :global(.dark) #editor-toolbar .tox-tbtn:hover,
          :global(.dark) #editor-toolbar .tox-mbtn:hover {
            background: rgba(255, 255, 255, 0.1) !important;
          }

          /* Hide statusbar if it reappears */
          .tox-statusbar,
          .tox-promotion {
            display: none !important;
          }

          /* Remove the blue focus outline from the editor content */
          .tox-edit-area__iframe,
          [contenteditable]:focus {
            outline: none !important;
            box-shadow: none !important;
          }

          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              background: white !important;
            }
            .custom-scrollbar::-webkit-scrollbar {
              display: none;
            }
            /* Hide TinyMCE UI elements on print */
            .tox-editor-header,
            .tox-statusbar,
            #editor-toolbar,
            header {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </PermissionGate>
  );
}
