"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";
import LetterheadEditorTinyMCE from "@/components/letterhead/LetterheadEditorTinyMCE";
import PermissionGate from "@/components/ui/PermissionGate";
import LogoHeader from "@/components/letterhead/LogoHeader";
import CompanyFooter from "@/components/letterhead/CompanyFooter";

export default function LetterheadView({ profile }) {
  const [content, setContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const bodyRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  // Auto-zoom for mobile (like InvoicePreview)
  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const standardWidth = 794; // A4 width in pixels (~210mm)
        // We subtract padding (32px from md:p-8, or just 16px safety)
        // InvoicePreview used 32px buffer.
        // LetterheadView has p-0 on mobile, md:p-8 on desktop.
        // Let's use a safe buffer of 32px to ensure edges aren't cut off.

        if (containerWidth < standardWidth) {
          // Calculate scale to fit
          const newZoom = (containerWidth - 32) / standardWidth;
          setZoom(newZoom);
        } else {
          // On desktop/large screens, default to 1 (or let user control?)
          // InvoicePreview resets to 1.
          // However, if we want to respect manual zoom on desktop, we might skip this.
          // But for consistency with "like invoice preview", we reset.
          // To avoid fighting manual zoom on desktop, maybe only reset if it was previously auto-scaled?
          // For now, simple approach:
          // If width > standard, setZoom(1) might be annoying if user zoomed in.
          // Let's ONLY scale down if it DOESN'T FIT.
          // If it fits, we don't force it to 1, unless we want to reset mobile state.
          // InvoicePreview logic: } else { setScale(1); }
          // Let's stick to InvoicePreview logic for "same like invoice preview".
          setZoom(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Visual Pagination Logic - restored for Page Guides
  useEffect(() => {
    if (!bodyRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        // A4 Height in px (approx 1123px at 96dpi, or just use mm logic if possible)
        // Using 1123px as a safe baseline for A4
        const A4_HEIGHT_PX = 1123;
        const calculatedPages = Math.max(
          1,
          Math.ceil((height + 100) / A4_HEIGHT_PX),
        );
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
        {/* Top Navigation Bar / Toolbar Area */}
        <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm print:hidden">
          <div className="flex flex-row items-center justify-between px-2 sm:px-4 py-2 gap-2">
            {/* TinyMCE will teleport its toolbar here via fixed_toolbar_container: '#editor-toolbar' */}
            <div
              id="editor-toolbar"
              className="flex-1 min-h-[40px] relative z-50 min-w-0"
            />

            {/* Right: Actions */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3 justify-end relative shrink-0">
              {/* Zoom Controls */}
              <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <button
                  type="button"
                  onClick={zoomOut}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md text-gray-600 dark:text-gray-300"
                  title="Zoom Out"
                >
                  <ChevronLeft className="w-4 h-4 rotate-90" />{" "}
                  {/* Reuse chevron for cleaner bundle if needed or use proper icons */}
                </button>
                <div className="hidden sm:block">
                  <span className="text-xs font-mono w-10 sm:w-12 text-center text-gray-600 dark:text-gray-300 inline-block">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={zoomIn}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md text-gray-600 dark:text-gray-300"
                  title="Zoom In"
                >
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md text-white text-xs sm:text-sm font-medium transition h-8 sm:h-auto"
              >
                <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="sm:inline">Print</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace - Centered A4 Page */}
        <div ref={containerRef} className="flex-1 overflow-auto overflow-x-hidden p-0 md:p-8 relative flex justify-center bg-gray-100 dark:bg-slate-900 print:p-0 print:bg-white print:overflow-visible">
          <div
            className="transition-transform duration-200 origin-top flex flex-col items-center print-content-container md:w-auto"
            style={{
              transform: `scale(${zoom})`,
              marginBottom: `${(zoom - 1) * 300}px`, // Compensate spacing when zoomed in
              width: "210mm",
              minWidth: "210mm",
            }}
          >
            <div className="relative flex flex-col items-center w-full md:w-auto">
              {/* VISUAL BACKGROUND LAYER REMOVED for Continuous View */}

              {/* CONTENT LAYER (Interactive) */}
              {/* We use the Table structure to support robust printing, but make it transparent on screen */}
              <div className="relative z-10 w-[210mm] min-w-[210mm] min-h-[297mm] print:w-full print:block bg-white md:shadow-xl print:shadow-none text-gray-900">
                {/* Visual Page Break Guides (Screen Only) */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 print:hidden overflow-hidden">
                  {[...Array(pageCount)].map((_, i) => {
                    if (i === 0) return null; // No break before page 1

                    const A4_HEIGHT_PX = 1123;
                    const HEADER_HEIGHT = 160;
                    const FOOTER_HEIGHT = 160;
                    const TOTAL_VERTICAL_RESERVED =
                      HEADER_HEIGHT + FOOTER_HEIGHT; // ~320px
                    const USABLE_Height =
                      A4_HEIGHT_PX - TOTAL_VERTICAL_RESERVED; // ~803px per page
                    const TOP_SPACER = 40; // The h-10 div on screen

                    // Position = Spacer + (Page * UsableHeight)
                    // This marks where the text *content* breaks to the next page
                    const topPos = TOP_SPACER + i * USABLE_Height;

                    return (
                      <div
                        key={i}
                        className="absolute w-full border-b border-dashed border-blue-300 flex items-end justify-end pr-2 text-xs text-blue-400 font-medium"
                        style={{ top: `${topPos}px` }}
                      >
                        <span className="mb-1 bg-white px-1 shadow-sm rounded">
                          Page {i} End / Page {i + 1} Start
                        </span>
                      </div>
                    );
                  })}
                </div>

                <table className="w-full h-full print:h-auto border-collapse">
                  {/* Print Headers (Hidden on screen via CSS, Visible in Print) */}
                  <thead className="print-header-group hidden print:table-header-group">
                    <tr>
                      <td className="w-full px-6 sm:px-12 pt-6 sm:pt-10">
                        <LogoHeader profile={profile} />
                        <div className="h-4" />
                      </td>
                    </tr>
                  </thead>

                  {/* Spacer tfoot to prevent text overlapping the Fixed Footer */}
                  {/* Native Table Footer - Repeats on every page automatically */}
                  <tfoot className="print-footer-group hidden print:table-footer-group">
                    <tr>
                      <td className="w-full px-6 sm:px-12 pb-6 sm:pb-10 align-bottom">
                        <CompanyFooter profile={profile} />
                      </td>
                    </tr>
                  </tfoot>

                  <tbody>
                    <tr>
                      <td className="align-top w-full px-4 sm:px-8 md:px-20">
                        {/* On Screen: Spacer to push text below visual header of Page 1 */}
                        {/* Note: Subsequent pages will overlap visuals. This is a trade-off of this method. */}
                        {/* Header spacer handled by thead in print, but we need visual gap on screen */}
                        {/* Removed visual gap on screen for continuous view as well, or keep small padding? */}
                        {/* User wants "Continuous Page", so usually just a white sheet. */}
                        <div className="h-10 print:hidden" />

                        <main
                          ref={bodyRef}
                          className="relative min-h-[820px] pb-[50px]"
                        >
                          {isMounted ? <LetterheadEditorTinyMCE
                            content={content}
                            setContent={setContent}
                          /> : null}
                        </main>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* FIXED PRINT FOOTER: Moved outside sizing container */}
          {/* FIXED PRINT FOOTER REMOVED - using native table-footer-group instead */}
        </div>

        <style jsx global>{`
          /* TinyMCE Auxiliary Container - Must be at body level with highest z-index */
          .tox.tox-tinymce-aux {
            z-index: 99999 !important;
          }

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

          /* --- TOOLBAR CONTAINER STYLES --- */

          /* Base Styles (Light Mode Default) */
          #editor-toolbar .tox-tinymce {
            border: none !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            background: transparent !important;
          }

          #editor-toolbar .tox-editor-header,
          #editor-toolbar .tox-menubar,
          #editor-toolbar .tox-toolbar-overlord,
          #editor-toolbar .tox-toolbar__primary {
            background: transparent !important; /* Default to transp/white */
            border: none !important;
            box-shadow: none !important;
          }

          /* Toolbar groups transparent */
          #editor-toolbar .tox-toolbar__group,
          #editor-toolbar .tox-mbtn,
          #editor-toolbar .tox-tbtn,
          #editor-toolbar .tox-split-button {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Hide scrollbars in toolbar area */
          #editor-toolbar::-webkit-scrollbar,
          .tox-toolbar::-webkit-scrollbar {
            display: none;
          }

          #editor-toolbar,
          .tox-toolbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          /* Remove the blue focus outline from the editor content */
          .tox-edit-area__iframe,
          [contenteditable]:focus {
            outline: none !important;
            box-shadow: none !important;
          }


          /* --- DARK MODE OVERRIDES --- */

          /* Apply dark background ONLY in dark mode */
          :global(.dark) #editor-toolbar .tox-tinymce,
          :global(.dark) #editor-toolbar .tox-editor-header,
          :global(.dark) #editor-toolbar .tox-menubar,
          :global(.dark) #editor-toolbar .tox-toolbar-overlord,
          :global(.dark) #editor-toolbar .tox-toolbar__primary,
          :global(.dark) #editor-toolbar .tox-toolbar__overflow,
          :global(.dark) .tox-sidebar-wrap,
          :global(.dark) .tox-editor-container {
            background: #1e293b !important; /* slate-800 */
            background-color: #1e293b !important;
          }

          /* Dark Mode Text & Icon Colors */
          :global(.dark) #editor-toolbar {
            color: #e2e8f0; /* slate-200 */
            --tox-color: #e2e8f0;
          }

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

          /* Fix for selected/active menu items in Dark Mode */
          :global(.dark) .tox .tox-collection__item--active,
          :global(.dark) .tox .tox-collection__item--enabled,
          :global(.dark) .tox .tox-collection__item:focus,
          :global(.dark) .tox .tox-mbtn--active,
          :global(.dark) .tox .tox-tbtn--enabled,
          :global(.dark) .tox .tox-tbtn:focus,
          :global(.dark) .tox .tox-tbtn:active {
            background-color: #334155 !important; /* slate-700 */
            color: #e2e8f0 !important;
          }

          /* Dark theme for dropdown menus */
          :global(.dark) .tox .tox-menu,
          :global(.dark) .tox .tox-collection,
          :global(.dark) .tox .tox-collection__group,
          :global(.dark) .tox .tox-dialog,
          :global(.dark) .tox .tox-pop,
          :global(.dark) .tox-menu.tox-collection,
          :global(.dark) .tox-collection--list {
            background-color: #1e293b !important; /* slate-800 */
            border-color: #334155 !important; /* slate-700 */
          }

          :global(.dark) .tox .tox-collection__item,
          :global(.dark) .tox .tox-menu__item,
          :global(.dark) .tox .tox-collection__item-label,
          :global(.dark) .tox .tox-insert-table-picker__cell {
            color: #e2e8f0 !important;
          }

          /* Force all children of collection items to be light in dark mode (Fix for Heading previews) */
          :global(.dark) .tox .tox-collection__item-label *,
          :global(.dark) .tox .tox-collection__item-label span,
          :global(.dark) .tox .tox-collection__item-label h1,
          :global(.dark) .tox .tox-collection__item-label h2,
          :global(.dark) .tox .tox-collection__item-label h3,
          :global(.dark) .tox .tox-collection__item-label h4,
          :global(.dark) .tox .tox-collection__item-label h5,
          :global(.dark) .tox .tox-collection__item-label h6,
          :global(.dark) .tox .tox-collection__item-label p {
             color: #e2e8f0 !important;
             background: transparent !important;
          }

          :global(.dark) .tox .tox-collection__item:hover,
          :global(.dark) .tox .tox-menu__item:hover {
            background-color: #334155 !important;
          }
           
          /* Specific fix for the Table Picker Grid in Dark Mode */
          :global(.dark) .tox .tox-insert-table-picker {
             background-color: #1e293b !important; 
          }

          /* Hide statusbar unconditionally */
          .tox-statusbar,
          .tox-promotion {
            display: none !important;
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
              margin: 0;
            }
            html,
            body {
              background: white !important;
              margin: 0;
            }

            /* Table Print Properties */
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            /* Only prevent breaking in header/footer rows */
            thead tr,
            tfoot tr {
              page-break-inside: avoid;
            }
            /* ALLOW breaking in the main content */
            tbody tr {
              page-break-inside: auto;
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

            /* Ensure full width for the container in print */
            .w-\[210mm\] {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              box-shadow: none !important;
              padding: 0 !important;
            }

            /* FORCE EDITOR TEXT TO BE BLACK */
            /* Crucial because in Dark Mode, the parent text is white, but the "Paper" is white, so text must be black */
            #letterhead-editor {
              color: #000000 !important;
              caret-color: #000000 !important;
            }

            /* Disable transform in print to prevent fixed position and pagination issues */
            .print-content-container {
              transform: none !important;
              margin: 0 !important;
              display: block !important;
              width: 100% !important;
            }

            /* Fixed Footer for Print */
            .footer-fixed-container {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              width: 100% !important;
              background: white !important;
              padding-left: 3rem !important; /* px-12 = 3rem */
              padding-right: 3rem !important;
              padding-bottom: 2.5rem !important; /* pb-10 = 2.5rem */
              z-index: 50;
            }

            /* Reserve space in flow so content doesn't overlap fixed footer */
            tfoot {
              display: table-footer-group !important;
              height: 120px !important; /* 80px content + 40px padding approx */
            }
            tfoot td {
              height: 120px !important;
              border: none !important;
            }
          }
        `}</style>
      </div>
    </PermissionGate>
  );
}
