import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import { DriftSidebar } from "@/components/app_ui/sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
// import '@mdxeditor/editor/style.css'

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

export const metadata: Metadata = {
  title: "Driftwood",
  description: "Static blog generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <div className="flex h-screen">
            <DriftSidebar />
            <main className="flex-1 overflow-auto p-4">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
