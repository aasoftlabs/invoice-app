import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          await connectDB();
          const user = await User.findOne({ email }).lean();

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar,
              permissions: user.permissions || [],
            };
          }
        }


        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.avatar;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        await connectDB();
        const user = await User.findById(token.id).select(
          "role permissions avatar",
        );

        if (user) {
          session.user.role = user.role;
          session.user.id = token.id;
          session.user.image = user.avatar;
          session.user.permissions = user.permissions || [];
        } else {
          // If user not found, fallback to token data or clear session
          session.user.role = token.role;
          session.user.id = token.id;
          session.user.image = token.picture;
          session.user.permissions = token.permissions || [];
        }
      }
      return session;
    },
  },
});

export { handlers, auth, signIn, signOut };
