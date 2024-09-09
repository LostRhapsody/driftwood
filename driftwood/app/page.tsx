"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import React from "react";
import LoginButton from "@/components/app_ui/login_button";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import Link from "next/link";
import Footer from "@/components/app_ui/footer";
import Sites from "@/components/app_ui/sites";
import { AlignLeft, Globe } from "lucide-react";
export default function Home() {
  const [hasToken, setHasToken] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return (
          <div className="text-center">
            <h1 className="text-5xl font-extrabold pb-4">Driftwood</h1>
            <div className="flex flex-row gap-8 justify-center">
              <Button
                id="create_site"
                className="w-40 h-40 flex flex-col gap-4"
                onClick={() => handleNavigation("create_site")}
              >
                <Globe size={64} />
                <p>Create new site</p>
              </Button>
              <Button
                id="create_site"
                className="w-40 h-40 flex flex-col gap-4"
                onClick={() => handleNavigation("sites")}
              >
                <AlignLeft size={64} />
                <p>List your sites</p>
              </Button>
            </div>

          </div>
        );
      case "sites":
        return <Sites />;
      default:
        return <div>Home sweet home default</div>;
    }
  };

  const handleNavigation = (page: string) => {
    console.log("Navigating to:", page);
    setCurrentPage(page);
  };

  const handleLoginSuccess = (hasToken: boolean) => {
    setHasToken(hasToken);
  };

  const handleLoginFailure = (error: any) => {
    console.error("Login failed:", error);
    setHasToken(false);
  };

  // TODO finish implementing and testing this
  useEffect(() => {
    const checkToken = async () => {
      try {
        const response = await invoke<boolean>("check_token");
        setHasToken(response);
      } catch (err) {
        console.error(err);
      }
    };

    checkToken();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between font-[family-name:var(--font-geist-sans)]">
      <header>
        <nav className="flex flex-row gap-8 p-4">
            {!hasToken ? (
              <LoginButton
                onLoginSuccess={handleLoginSuccess}
                onLoginFailure={handleLoginFailure}
              />
            ) : (
              <Button className="text-xl p-6">
                <p>Logout</p>
              </Button>
            )}
          <Button
            className="text-xl p-6"
            onClick={() => handleNavigation("home")}
          >
            Home
          </Button>
          <Link href="404">
            <Button className="text-xl p-6">404</Button>
          </Link>
        </nav>
      </header>
      <main className="flex flex-col gap-8 align-top rounded-xl">
        {!hasToken ? (
          <div className="text-center">
            <h1 className="text-7xl">Driftwood</h1>
            <p className="text-xl">Static blog generator</p>
            <p className="text-xl">
              Please log in to Netlify to continue (top left)
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">{renderContent()}</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
