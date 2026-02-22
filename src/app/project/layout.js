import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProjectLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <main className="flex-1 overflow-auto">{children}</main>
    </SessionProvider>
  );
}
