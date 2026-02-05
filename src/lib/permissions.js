// Utility function to check if user has permission to access a page
export function hasPermission(user, page) {
  if (!user) return false;

  // Admin has access to everything
  if (user.role === "admin") return true;

  // Notes, Profile, and Attendance are allowed to all users by default
  if (page === "notes" || page === "profile" || page === "attendance")
    return true;

  // Check if user has specific permission
  return user.permissions && user.permissions.includes(page);
}

// Get all permissions for a user
export function getUserPermissions(user) {
  if (!user) return [];

  // Admin gets all permissions
  if (user.role === "admin") {
    return [
      "invoices",
      "letterhead",
      "project",
      "users",
      "profile",
      "notes",
      "payroll",
      "accounts",
      "attendance",
    ];
  }

  const perms = user.permissions || [];
  if (!perms.includes("notes")) {
    perms.push("notes");
  }
  if (!perms.includes("profile")) {
    perms.push("profile");
  }

  if (!perms.includes("attendance")) {
    perms.push("attendance");
  }
  return perms;
}

// Check if user can access route
export function canAccessRoute(user, pathname) {
  if (!user) return false;

  // Admin can access everything
  if (user.role === "admin") return true;

  // Map routes to permissions
  const routePermissions = {
    "/invoices": "invoices",
    "/letterhead": "letterhead",
    "/project": "project",
    "/users": "users",
    "/profile": "profile",
    "/notes": "notes",
    "/payroll": "payroll",
    "/accounts": "accounts",
    "/attendance": "attendance",
  };

  // Find matching route
  for (const [route, permission] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      return hasPermission(user, permission);
    }
  }

  // Allow access to root and other pages by default
  return true;
}
