import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white z-50 relative">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );
}
