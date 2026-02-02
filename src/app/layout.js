import { Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/contexts/ToastContext";
import { SessionProvider } from "next-auth/react";
import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import GlobalNoteButton from "@/components/notes/GlobalNoteButton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/contexts/ModalContext";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "AA SoftLabs™ | Office",
  description:
    "AA SoftLabs provides scalable web and mobile solutions. Expert development in Next.js, React Native, and business automation. Powered by ADMINASHU SOFTLABS.",
  icons: {
    icon: "/icon.ico", // Path to your favicon
  },
  authors: [{ name: "ADMINASHU SOFTLABS" }],
  creator: "ADMINASHU SOFTLABS",
  publisher: "ADMINASHU SOFTLABS",
  keywords: [
    "AA SoftLabs",
    "ADMINASHU SOFTLABS",
    "Web Development",
    "Mobile Development",
    "Business Automation",
    "Next.js",
    "React Native",
  ],
};

import { auth } from "@/auth";

export default async function RootLayout({ children }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <SessionProvider session={session}>
              <ModalProvider>
                <NavbarWrapper />
                {children}
                <GlobalNoteButton />
                <Footer />
              </ModalProvider>
            </SessionProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
