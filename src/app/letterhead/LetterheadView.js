"use client";

import { useState, useRef } from "react";
import { Upload, Printer } from "lucide-react";
import BrandName from "@/components/BrandName";

export default function LetterheadView({ profile }) {
    const [content, setContent] = useState("Type or paste your document content here...");
    const fileInputRef = useRef(null);

    const handlePrint = () => {
        window.print();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setContent(event.target.result);
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Controls - Hidden in Print */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <h1 className="text-2xl font-bold text-gray-800">Letterhead</h1>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".txt,.md,.json,.csv"
                        className="hidden"
                    />
                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 transition"
                    >
                        <Upload className="w-4 h-4" /> Import Text
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        <Printer className="w-4 h-4" /> Print / Download PDF
                    </button>
                </div>
            </div>

            {/* A4 Paper Preview */}
            <div className="max-w-[210mm] min-h-[297mm] mx-auto bg-white shadow-2xl print:shadow-none print:w-full print:max-w-none print:m-0 flex flex-col px-12 py-10 relative box-border">

                {/* Header / Letterhead Top */}
                <header className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
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
                            <span style={{ color: profile.formatting?.color, fontWeight: "bold" }}>Contact Us</span>
                            {profile?.phone && <p><span>+91 </span> {profile.phone}</p>}
                            {profile?.email && <p>{profile.email}</p>}
                        </div>
                    </div>
                </header>

                {/* Content Area - Editable */}
                <div className="flex-grow relative group">
                    {/* Invisible Textarea for Editing, visible styling wrapper */}
                    <textarea
                        className="w-full h-full min-h-[500px] resize-none border-none outline-none bg-transparent text-gray-800 font-serif leading-relaxed text-base whitespace-pre-wrap p-2 focus:ring-1 focus:ring-blue-100 rounded"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type your document content here..."
                    />
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-300 print:hidden pointer-events-none">
                        Editable Area
                    </div>
                </div>

                {/* Footer with Company Details */}
                <footer className="mt-auto pt-8 border-t-2 border-gray-100 text-xs text-gray-500 text-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-left">
                        {/* Registered Office */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">Registered Office</h4>
                            <p className="whitespace-pre-line leading-relaxed">{profile?.address}</p>
                        </div>
<div>

</div>
                        {/* Registration Details */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1">Registration</h4>
                            {profile?.registrationNo && (
                                <p>
                                    <span className="font-medium">{`${profile?.registrationType} No:`}</span> {profile?.registrationNo}
                                </p>
                            )}
                            {profile?.gstIn && (
                                <p>
                                    <span className="font-medium">GSTIN:</span> {profile?.gstIn}
                                </p>
                            )}
                            {/* {profile?.pan && (
                                <p>
                                    <span className="font-medium">PAN:</span> {profile?.pan}
                                </p>
                            )} */}
                        </div>
                    </div>

                  
                </footer>

            </div>

            <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            background: white;
          }
        }
      `}</style>
        </div >
    );
}
