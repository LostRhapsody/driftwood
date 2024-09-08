"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { useToken } from "@/app/TokenContext";
import { Button } from "@/components/ui/button";
import LoginButton from "@/components/app_ui/login_button";
import MainMenuOptions from "@/components/app_ui/main_menu_options";
import Sites from "@/components/app_ui/sites";

export default function Home() {
  const {hasToken, setHasToken} = useToken();

  const handleLoginSuccess = (hasToken: boolean) => {
    setHasToken(hasToken);
  };

  const handleLoginFailure = (error: any) => {
    console.error("Login failed:", error);
    setHasToken(false);
  };

  const show_sites = () => {
    console.log("show_sites");
    const container = document.getElementById("container");
    if (container) {
      console.log("container");
      container.innerHTML = "hi<Sites />";
    } else {
      console.log("container not found");
    }
  }


  return (
    <div className="grid grid-rows items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-7xl">Driftwood</h1>
          {!hasToken ? (
            <LoginButton
              onLoginSuccess={handleLoginSuccess}
              onLoginFailure={handleLoginFailure}
            />
          ):(
            <>
              <div id="container">
              </div>
              <Button onClick={show_sites}>Trigger</Button>
              <MainMenuOptions />
            </>
          )}
      </main>
    </div>
  );
}
