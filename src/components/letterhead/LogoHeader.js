"use client";

import NextImage from "next/image";
import BrandName from "@/components/BrandName";

export default function LogoHeader({ profile }) {
  return (
    <div className="flex justify-between items-start border-b-2 border-blue-500 pb-2 mb-2 min-h-[80px] w-full">
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
          {profile.slogan ? <div className="text-[8px] text-gray-500 uppercase mt-1">
              {profile.slogan}
            </div> : null}
          {profile.tagline ? <div
              className="text-[10px] uppercase font-bold mt-1"
              style={{ color: profile.formatting?.color || "#1d4ed8" }}
            >
              {profile.tagline}
            </div> : null}
        </div>
      </div>
      <div className="text-right text-xs text-gray-500 leading-relaxed pt-2">
        <div className="mb-3">
          <span
            className="uppercase font-bold"
            style={{ color: profile.formatting?.color }}
          >
            Contact Us
          </span>
          {profile?.phone ? <p>
              <span>+91 </span> {profile.phone}
            </p> : null}
          {profile?.email ? <p>{profile.email}</p> : null}
        </div>
      </div>
    </div>
  );
}
