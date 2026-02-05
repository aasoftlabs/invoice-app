export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      // Allow access to login page, but redirect if already logged in
      if (nextUrl.pathname.startsWith("/login")) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      // Allow access to setup page (for first run)
      if (nextUrl.pathname.startsWith("/setup")) return true;

      // Allow access to forgot/reset password pages
      if (nextUrl.pathname.startsWith("/forgot-password")) return true;
      if (nextUrl.pathname.startsWith("/reset-password")) return true;

      // Allow access to API routes
      if (nextUrl.pathname.startsWith("/api")) return true;

      // For now, let's just allow everything to keep dev speed up,
      // or STRICT: Redirect to login if not logged in.
      // Given "Authjs" requirement, we should probably protect the app.
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
};
