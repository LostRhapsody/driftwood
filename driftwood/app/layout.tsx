import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DriftSidebar } from "@/components/app_ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SelectedSiteProvider } from "@/contexts/SelectedSiteContext";
import { useEffect, useState } from "react";
import { useSelectedSite } from "@/contexts/SelectedSiteContext";
import { invoke } from "@tauri-apps/api/core";
import '@mdxeditor/editor/style.css'
import { type DriftResponse, processResponse } from "@/types/response";
import type { Site } from "@/types/site";

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

export const metadata: Metadata = {
  title: "Driftwood",
  description: "Static blog generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { selectedSite, setSelectedSite } = useSelectedSite();
  const [sitesData, setSiteData] = useState<Site[]>([]);

  useEffect(() => {
    const loadSites = async () => {
      const response = await invoke<DriftResponse<Site[]>>("list_sites");

      const result = processResponse(response);

      if (result) setSiteData(response.body);
      else alert("Failed to load sites");

      setSelectedSite(sitesData[0]);
    };

    loadSites();
  }, [setSelectedSite,sitesData]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SelectedSiteProvider>
          <SidebarProvider>
            <div className="flex h-screen">
              <DriftSidebar
              selectedSite={selectedSite}
              setSelectedSite={setSelectedSite}
              sitesData={sitesData}
              />
              <main className="flex-1 overflow-auto p-4">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </SelectedSiteProvider>
      </body>
    </html>
  );
}
