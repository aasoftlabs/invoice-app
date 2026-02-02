"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "confirm", // confirm, alert
        variant: "default", // default, danger, warning, success
        onConfirm: () => { },
        onCancel: () => { },
        confirmText: "Confirm",
        cancelText: "Cancel",
    });

    const confirm = useCallback(
        ({
            title = "Are you sure?",
            message = "This action cannot be undone.",
            confirmText = "Confirm",
            cancelText = "Cancel",
            variant = "default",
        } = {}) => {
            return new Promise((resolve) => {
                setModal({
                    isOpen: true,
                    type: "confirm",
                    title,
                    message,
                    confirmText,
                    cancelText,
                    variant,
                    onConfirm: () => {
                        setModal((prev) => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                    onCancel: () => {
                        setModal((prev) => ({ ...prev, isOpen: false }));
                        resolve(false);
                    },
                });
            });
        },
        [],
    );

    const alert = useCallback(
        ({
            title = "Alert",
            message = "",
            confirmText = "OK",
            variant = "default",
        } = {}) => {
            return new Promise((resolve) => {
                setModal({
                    isOpen: true,
                    type: "alert",
                    title,
                    message,
                    confirmText,
                    cancelText: "",
                    variant,
                    onConfirm: () => {
                        setModal((prev) => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                    onCancel: () => {
                        setModal((prev) => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                });
            });
        },
        [],
    );

    const close = useCallback(() => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ModalContext.Provider value={{ confirm, alert, close }}>
            {children}
            {modal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center gap-4">
                                {modal.variant === "danger" && (
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                        <AlertCircle className="w-8 h-8" />
                                    </div>
                                )}
                                {modal.variant === "warning" && (
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                )}
                                {modal.variant === "success" && (
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                )}
                                {(modal.variant === "default" || !modal.variant) && (
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        <Info className="w-8 h-8" />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {modal.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                                        {modal.message}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                {modal.type === "confirm" && (
                                    <button
                                        onClick={modal.onCancel}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-slate-700"
                                    >
                                        {modal.cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={modal.onConfirm}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${modal.variant === "danger"
                                            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/20"
                                            : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                                        }`}
                                >
                                    {modal.confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};
