"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import Spotlight from "@/components/ui/Spotlight";
import LetterheadEditorTinyMCE from "@/components/letterhead/LetterheadEditorTinyMCE";
import BrandName from "@/components/BrandName";
import PermissionGate from "@/components/ui/PermissionGate";

// Helper Components for Reusability
const LogoHeader = ({ profile }) => (
  <div className="flex justify-between items-start border-b-2 border-blue-500 pb-2 mb-2 h-[80px]">
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
        <BrandName name={profile.name} color={profile.formatting?.color} />
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
      <div className="mb-3">
        <span
          className="uppercase font-bold"
          style={{ color: profile.formatting?.color }}
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
  </div>
);

const CompanyFooter = ({ profile }) => (
  <div className="pt-2 border-t-2 border-blue-500 text-xs text-gray-500 text-center h-[100px] flex flex-col justify-end pb-4">
    <div className="flex justify-between gap-40 mb-2 text-left">
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
  </div>
);

export default function LetterheadView({ profile }) {
  const [content, setContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const bodyRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Visual Pagination Logic
  useEffect(() => {
    if (!bodyRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // A4 Height approx 1123px.
        // We add a buffer or just calculate raw pages.
        // Subtracting header/footer visual height from useful area?
        // Simplest: Content Height / (A4 px - margins)
        const height = entry.contentRect.height;
        const A4_HEIGHT = 1123;
        const calculatedPages = Math.max(
          1,
          Math.ceil((height + 300) / A4_HEIGHT),
        ); // +300 for header/footer buffer
        setPageCount(calculatedPages);
      }
    });
    observer.observe(bodyRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePrint = () => {
    const previousZoom = zoom;
    setZoom(1);
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
            <div className="flex items-center gap-3 min-w-[200px] justify-end relative z-50">
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

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md text-white text-sm font-medium transition"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace - Centered A4 Page */}
        <div className="flex-1 overflow-auto p-8 relative flex justify-center bg-gray-100 dark:bg-slate-900 print:p-0 print:bg-white print:overflow-visible">
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center"
            style={{
              transform: `scale(${zoom})`,
              marginBottom: `${(zoom - 1) * 300}px`, // Compensate spacing when zoomed in
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* VISUAL BACKGROUND LAYER (Screen Only) - Stacks pages vertically */}
              <div
                className="absolute top-0 left-0 w-full h-full flex flex-col items-center gap-[20px] print:hidden pointer-events-none select-none z-0"
                style={{
                  // Ensure container grows to fit all pages
                  height: `${pageCount * 1143}px`, // 1123px (A4) + 20px (gap)
                }}
              >
                {[...Array(pageCount)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[210mm] h-[297mm] min-h-[297mm] bg-white shadow-xl flex flex-col justify-between px-12 py-10 box-border"
                  >
                    <LogoHeader profile={profile} />
                    <CompanyFooter profile={profile} />
                  </div>
                ))}
              </div>

              {/* CONTENT LAYER (Interactive) */}
              {/* We use the Table structure to support robust printing, but make it transparent on screen */}
              <div className="relative z-10 w-[210mm] min-h-[297mm] print:w-full print:block">
                <table className="w-full h-full border-collapse">
                  {/* Print Headers (Hidden on screen via CSS, Visible in Print) */}
                  <thead className="print-header-group hidden print:table-header-group">
                    <tr>
                      <td className="w-full">
                        <LogoHeader profile={profile} />
                        <div className="h-4"></div>
                      </td>
                    </tr>
                  </thead>

                  <tfoot className="print-footer-group hidden print:table-footer-group">
                    <tr>
                      <td className="w-full">
                        <div className="h-4"></div>
                        <CompanyFooter profile={profile} />
                      </td>
                    </tr>
                  </tfoot>

                  <tbody>
                    <tr>
                      <td className="align-top w-full px-12">
                        {/* On Screen: Spacer to push text below visual header of Page 1 */}
                        {/* Note: Subsequent pages will overlap visuals. This is a trade-off of this method. */}
                        <div className="h-[140px] print:hidden"></div>

                        <main ref={bodyRef} className="relative min-h-[500px]">
                          {isMounted && (
                            <LetterheadEditorTinyMCE
                              content={content}
                              setContent={setContent}
                            />
                          )}
                        </main>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
            /* GLOBAL OVERRIDE: Remove all scrollbars and allow height expansion */
            *,
            *:before,
            *:after {
              overflow: visible !important;
              /* Careful with height auto global, but normally good for print to avoid cutting off */
            }
            .tox-tinymce {
              height: auto !important;
            }

            @page {
              size: A4;
              margin: 10mm; /* Give browser margin to handle header/footer bleed */
            }
            body {
              background: white !important;
              margin: 0;
            }

            /* Table Print Properties - Keyword for repeating headers/footers */
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            tr {
              page-break-inside: avoid;
            }

            .custom-scrollbar::-webkit-scrollbar {
              display: none;
            }

            /* Hide UI elements */
            .tox-editor-header,
            .tox-statusbar,
            #editor-toolbar,
            header.sticky {
              display: none !important;
            }

            /* Ensure full width */
            .max-w-\[210mm\] {
              max-width: none !important;
              width: 100% !important;
              margin: 0 !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    </PermissionGate>
  );
}
