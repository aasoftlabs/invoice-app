"use client";

import Link from "next/link";
import { Lock, ShieldAlert } from "lucide-react";
import Spotlight from "@/components/ui/Spotlight";

export default function DashboardFeatureCard({ feature, hasAccess }) {
  // Color styles mapping
  const blueStyle = {
    hover: "hover:border-blue-300 dark:hover:border-blue-500/50",
    bg: "bg-blue-50",
    darkBg: "dark:bg-blue-400/10",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    spotlight: "rgba(59, 130, 246, 0.1)", // Blue spotlight
  };

  const colorStyles = {
    blue: blueStyle,
    green: blueStyle,
    purple: blueStyle,
    orange: blueStyle,
    yellow: blueStyle,
    cyan: blueStyle,
    rose: blueStyle,
    indigo: blueStyle,
  };

  const style = colorStyles[feature.color];

  const CardContent = (
    <Spotlight
      className={`h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xs relative overflow-hidden transition-all duration-300 ${
        hasAccess
          ? `${style.hover} hover:shadow-lg group`
          : "opacity-60 grayscale-[0.5]"
      }`}
      spotlightColor={style.spotlight}
      enabled={hasAccess}
    >
      {/* Corner Decoration */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${style.bg} ${
          style.darkBg
        } rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 ${
          hasAccess ? "group-hover:scale-110" : ""
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
        className={`text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 transition-colors ${
          hasAccess ? style.hoverText : ""
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

  return <div className="cursor-not-allowed">{CardContent}</div>;
}
