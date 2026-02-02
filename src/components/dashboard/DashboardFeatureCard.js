"use client";

import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";

export default function DashboardFeatureCard({ feature, hasAccess }) {
    // Color styles mapping
    const colorStyles = {
        blue: {
            hover: "hover:border-blue-300 dark:hover:border-blue-500/50",
            bg: "bg-blue-50",
            darkBg: "dark:bg-blue-400/10",
            iconBg: "bg-blue-100 dark:bg-blue-900/30",
            text: "text-blue-600 dark:text-blue-400",
            hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
            spotlight: "rgba(59, 130, 246, 0.1)", // Blue spotlight
        },
        green: {
            hover: "hover:border-green-300 dark:hover:border-green-500/50",
            bg: "bg-green-50",
            darkBg: "dark:bg-green-400/10",
            iconBg: "bg-green-100 dark:bg-green-900/30",
            text: "text-green-600 dark:text-green-400",
            hoverText: "group-hover:text-green-600 dark:group-hover:text-green-400",
            spotlight: "rgba(34, 197, 94, 0.1)", // Green spotlight
        },
        purple: {
            hover: "hover:border-purple-300 dark:hover:border-purple-500/50",
            bg: "bg-purple-50",
            darkBg: "dark:bg-purple-400/10",
            iconBg: "bg-purple-100 dark:bg-purple-900/30",
            text: "text-purple-600 dark:text-purple-400",
            hoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
            spotlight: "rgba(168, 85, 247, 0.1)", // Purple spotlight
        },
        orange: {
            hover: "hover:border-orange-300 dark:hover:border-orange-500/50",
            bg: "bg-orange-50",
            darkBg: "dark:bg-orange-400/10",
            iconBg: "bg-orange-100 dark:bg-orange-900/30",
            text: "text-orange-600 dark:text-orange-400",
            hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
            spotlight: "rgba(249, 115, 22, 0.1)", // Orange spotlight
        },
        yellow: {
            hover: "hover:border-yellow-300 dark:hover:border-yellow-500/50",
            bg: "bg-yellow-50",
            darkBg: "dark:bg-yellow-400/10",
            iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
            text: "text-yellow-600 dark:text-yellow-400",
            hoverText: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
            spotlight: "rgba(234, 179, 8, 0.1)", // Yellow spotlight
        },
        cyan: {
            hover: "hover:border-cyan-300 dark:hover:border-cyan-500/50",
            bg: "bg-cyan-50",
            darkBg: "dark:bg-cyan-400/10",
            iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
            text: "text-cyan-600 dark:text-cyan-400",
            hoverText: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
            spotlight: "rgba(6, 182, 212, 0.1)", // Cyan spotlight
        },
        rose: {
            hover: "hover:border-rose-300 dark:hover:border-rose-500/50",
            bg: "bg-rose-50",
            darkBg: "dark:bg-rose-400/10",
            iconBg: "bg-rose-100 dark:bg-rose-900/30",
            text: "text-rose-600 dark:text-rose-400",
            hoverText: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
            spotlight: "rgba(244, 63, 94, 0.1)", // Rose spotlight
        },
        indigo: {
            hover: "hover:border-indigo-300 dark:hover:border-indigo-500/50",
            bg: "bg-indigo-50",
            darkBg: "dark:bg-indigo-400/10",
            iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
            text: "text-indigo-600 dark:text-indigo-400",
            hoverText: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
            spotlight: "rgba(99, 102, 241, 0.1)", // Indigo spotlight
        },
    };

    const style = colorStyles[feature.color];

    const CardContent = (
        <Spotlight
            className={`h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xs relative overflow-hidden transition-all duration-300 ${hasAccess
                    ? `${style.hover} hover:shadow-lg group`
                    : "opacity-60 grayscale-[0.5]"
                }`}
            spotlightColor={style.spotlight}
            enabled={hasAccess}
        >
            {/* Corner Decoration */}
            <div
                className={`absolute top-0 right-0 w-24 h-24 ${style.bg} ${style.darkBg
                    } rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 ${hasAccess ? "group-hover:scale-110" : ""
                    }`}
            ></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div
                    className={`h-12 w-12 ${style.iconBg} rounded-xl flex items-center justify-center ${style.text}`}
                >
                    {feature.icon}
                </div>
                {!hasAccess && (
                    <div className="bg-gray-100 dark:bg-slate-700 p-1.5 rounded-lg text-gray-400 dark:text-slate-500">
                        <Lock className="w-4 h-4" />
                    </div>
                )}
            </div>

            <h3
                className={`text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 transition-colors ${hasAccess ? style.hoverText : ""
                    }`}
            >
                {feature.label}
            </h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm relative z-10 leading-relaxed mb-4">
                {feature.desc}
            </p>

            {!hasAccess && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-slate-500 mt-auto bg-gray-50 dark:bg-slate-700 py-1 px-2 rounded-md w-max border border-gray-100 dark:border-slate-600 relative z-10">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    ACCESS RESTRICTED
                </div>
            )}
        </Spotlight>
    );

    if (hasAccess) {
        return (
            <Link href={feature.href} className="block h-full">
                {CardContent}
            </Link>
        );
    }

    return (
        <div className="cursor-not-allowed">
            {CardContent}
        </div>
    );
}
