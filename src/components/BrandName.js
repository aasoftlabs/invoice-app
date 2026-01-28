import React from "react";

export default function BrandName({ name, color }) {
    // Specific branding for "AA SoftLabs"
    if (name === "AA SoftLabs") {
        return (
            <h1
                className="text-2xl font-extrabold m-0 leading-none flex items-start"
                style={{ fontFamily: "Verdana, sans-serif" }}
            >
                <span style={{ color: color || "#1d4ed8" }}>AA</span>
                <span className="text-gray-600 ml-1">SoftLabs</span>
                <sup className="text-[8px] text-gray-500 ml-0.5 mt-2">TM</sup>
            </h1>
        );
    }

    // Default rendering for other names
    return (
        <h1 className="text-2xl font-extrabold text-gray-900 m-0 leading-none">
            {name}
        </h1>
    );
}
