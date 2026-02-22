"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState(null);

  // Don't show navbar on setup, login, and verify pages
  const hideNavbar =

    pathname === "/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/verify");

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      try {
        // Fetch both profile and user data
        const [profileRes, userRes] = await Promise.all([
          fetch("/api/profile"),
          fetch(`/api/users/${session.user.id}`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            setProfile(profileData.data);
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData) {
            setUserData(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (session && !hideNavbar && status === "authenticated") {
      fetchData();
    }
  }, [session, hideNavbar, status]);

  if (hideNavbar) {
    return null;
  }

  // Merge session user with fetched user data
  const enrichedUser = userData
    ? {
      ...session?.user,
      name: userData.name,
      email: userData.email,
      designation: userData.designation,
      role: userData.role,
      permissions: userData.permissions,
    }
    : session?.user;

  return <Navbar user={enrichedUser} profile={profile} />;
}
