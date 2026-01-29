"use client";

export default function StatsCard({ title, value, subtitle, icon: Icon, color }) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200"
    };

    const bgClass = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">{title}</h3>
                {Icon && (
                    <div className={`p-2 rounded-lg border ${bgClass}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="flex flex-col">
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    );
}
