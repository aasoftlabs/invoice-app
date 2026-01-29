"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = "info") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000); // Auto dismiss after 3s
    }, [removeToast]);

    const value = useMemo(() => ({ addToast }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px] animate-in slide-in-from-right fade-in duration-300 ${toast.type === "success"
                            ? "bg-green-600"
                            : toast.type === "error"
                                ? "bg-red-600"
                                : "bg-blue-600"
                            }`}
                    >
                        {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
                        {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                        {toast.type === "info" && <Info className="w-5 h-5" />}
                        <span className="text-sm font-medium flex-1">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-white/80 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
