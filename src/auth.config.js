export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/");
      // Allow access to login page
      if (nextUrl.pathname.startsWith("/login")) return true;

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
