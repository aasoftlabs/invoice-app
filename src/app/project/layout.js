import connectDB from "@/lib/mongoose";
import { SessionProvider } from "next-auth/react";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import ProjectMobileNav from "@/components/project/ProjectMobileNav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProjectLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="flex flex-1 overflow-hidden min-h-[calc(100vh-64px)] pb-16 md:pb-0">
        <ProjectSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
        <ProjectMobileNav />
      </div>
    </SessionProvider>
  );
}
