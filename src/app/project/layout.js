import connectDB from "@/lib/mongoose";
import { SessionProvider } from "next-auth/react";
import ProjectSidebar from "@/components/project/ProjectSidebar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProjectLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check if user has permission to access project pages
  // If they have "project" permission, they can access ALL /project/* pages
  if (
    session.user.role !== "admin" &&
    !session.user.permissions?.includes("project")
  ) {
    redirect("/");
  }

  return (
    <SessionProvider>
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SessionProvider>
  );
}
