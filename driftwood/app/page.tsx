"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import React from "react";
import LoginButton from "@/components/app_ui/login_button";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/tauri";
import Link from "next/link";
import Home_Component from "@/components/app_ui/home";
import Footer from "@/components/app_ui/footer";
import Sites from "@/components/app_ui/sites";

export default function Home() {
  const [hasToken, setHasToken] = useState(true);
  const [currentPage, setCurrentPage] = useState("home");

  const renderContent = () => {
    switch (currentPage) {
      case "home":
        return <Home_Component />;
      case "sites":
        return <Sites />;
      default:
        return <div>Home sweet home default</div>;
    }
  };

  const handleNavigation = (page: string) => {
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
            <Button className="text-xl p-6">
              {!hasToken ? (
                <LoginButton
                  onLoginSuccess={handleLoginSuccess}
                  onLoginFailure={handleLoginFailure}
                />
              ) : (
                <p>Logout</p>
              )}
            </Button>
            <Button className="text-xl p-6" onClick={() => handleNavigation("home")}>Home</Button>
            <Button className="text-xl p-6" onClick={() => handleNavigation("sites")}>Your sites</Button>
            <Link href="404"><Button className="text-xl p-6">404</Button></Link>
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
          <div className="flex flex-col gap-8">
            {renderContent()}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
