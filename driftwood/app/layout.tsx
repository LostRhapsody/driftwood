"use client";
import localFont from "next/font/local";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar"
import { SelectedSiteProvider } from "@/contexts/SelectedSiteContext";
import { SelectedPageProvider } from "@/contexts/SelectedPageContext";
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
const overusedGrotesk = localFont({
  src: "./fonts/OverusedGrotesk-VF.woff2",
  variable: "--font-overused-grotesk",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${overusedGrotesk.variable} antialiased`}
      >
        <SelectedSiteProvider>
          <SelectedPageProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </SelectedPageProvider>
        </SelectedSiteProvider>
      </body>
    </html>
  );
}