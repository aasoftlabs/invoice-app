"use client";

import { useState, useRef } from "react";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import Spotlight from "@/components/ui/Spotlight";
import LetterheadToolbar from "@/components/letterhead/LetterheadToolbar";
import LetterheadEditor from "@/components/letterhead/LetterheadEditor";
import BrandName from "@/components/BrandName";
import PermissionGate from "@/components/ui/PermissionGate";

export default function LetterheadView({ profile }) {
  const [content, setContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [zoom, setZoom] = useState(1); // 1 = 100%
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

  // Zoom Controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setZoom(1);

  return (
    <PermissionGate permission="letterhead">
      <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900 print:p-0 print:bg-white text-gray-900 dark:text-slate-200 font-sans transition-all duration-300">
        {/* Left Sidebar Controls */}
        <div
          className={`relative bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-4 transition-all duration-300 ease-in-out print:hidden flex flex-col gap-4 shadow-sm overflow-hidden shrink-0 ${
            isSidebarOpen ? "w-[460px]" : "w-16"
          }`}
        >
          {/* Toggle Button Inside Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`absolute top-6 z-20 p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-300 transition-all ${
              isSidebarOpen ? "right-4" : "left-1/2 -translate-x-1/2"
            }`}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          {/* Sidebar Content */}
          <div
            className={`flex-1 flex flex-col gap-6 pt-2 transition-opacity duration-300 ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {/* Header */}
            <div className="pr-12">
              <div className="flex flex-row justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 px-2">
                  Letterhead
                </h1>
              </div>
              <Spotlight
                className="w-full bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                spotlightColor="rgba(255, 255, 255, 0.25)"
              >
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 hover:cursor-pointer text-white text-sm transition font-medium h-full"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
              </Spotlight>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 my-2"></div>

            {/* Custom Toolbar */}
            <div className="overflow-y-auto grow pr-2 custom-scrollbar">
              <LetterheadToolbar
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
          className="transition-all duration-300 flex-1 flex justify-center origin-top-center relative print:ml-0! print:w-full! print:mx-auto! print:left-0! p-8"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            marginBottom: `${(zoom - 1) * 300}px`,
          }}
        >
          <div className="max-w-[210mm] w-[210mm] min-h-[297mm] bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none print:m-0 flex flex-col px-12 py-10 relative box-border">
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
              <LetterheadEditor
                content={content}
                setContent={setContent}
                quillRef={quillRef}
              />
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

        <style jsx global>{`
          .ql-container.ql-snow {
            border: none !important;
          }
          .ql-editor {
            padding: 0 !important;
            min-height: 200mm;
            font-family: inherit;
            color: #1a1a1a;
            line-height: 1.5;
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
          }
        `}</style>
      </div>
    </PermissionGate>
  );
}
