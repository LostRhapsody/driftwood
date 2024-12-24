"use client";
import localFont from "next/font/local";
import "./globals.css";
import { DriftSidebar } from "@/components/app_ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SelectedSiteProvider } from "@/contexts/SelectedSiteContext";
import { useState } from "react";
import Dashboard from "./dashboard/page";
import Posts from "./posts/page";
import Profile from "./profile/page";
import Settings from "./settings/page";
import EditPost from "@/components/app_ui/edit_post";
import '@mdxeditor/editor/style.css'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState("EditPost");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SelectedSiteProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <DriftSidebar
                setCurrentPage={setCurrentPage}
              />
              <main className="flex-1 overflow-auto p-4">
                <h1 className="text-xl">
                  {currentPage}
                </h1>
                <hr className="mb-2" />
                {currentPage === "Dashboard" && <Dashboard />}
                {currentPage === "Posts" && <Posts />}
                {currentPage === "EditPost" && <EditPost post={{}} onSave={{}} />}
                {currentPage === "Profile" && <Profile />}
                {currentPage === "Settings" && <Settings />}
                {children}
              </main>
            </div>
          </SidebarProvider>
        </SelectedSiteProvider>
      </body>
    </html>
  );
}
