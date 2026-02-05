"use client";

import { useSession } from "next-auth/react";
import AccessDenied from "./AccessDenied";
import { Loader2 } from "lucide-react";

export default function PermissionGate({
  permission,
  children,
  fallback = null,
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500 animate-pulse font-medium">
          Verifying access...
        </p>
      </div>
    );
  }

  const hasAccess =
    session?.user?.role === "admin" ||
    session?.user?.permissions?.includes(permission);

  if (!hasAccess) {
    return fallback || <AccessDenied />;
  }

  return children;
}
