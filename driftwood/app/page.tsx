"use client";
import { useState } from "react";
import Dashboard from "./dashboard/page";
import Posts from "./posts/page";
import Profile from "./profile/page";
import Settings from "./settings/page";
import EditPost from "@/components/app_ui/edit_post";
import CreatePost from "@/components/app_ui/create_post";
import { DriftSidebar } from "@/components/app_ui/sidebar"
import { useSelectedPage } from "@/contexts/SelectedPageContext";
import LoginButton from "@/components/app_ui/login_button";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { LogOut } from "lucide-react";

export default function page() {
  const { selectedPage } = useSelectedPage();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // check if logged into netlify
  const handleLoginSuccess = (hasToken: boolean) => {
		setIsLoggedIn(hasToken);
	};

	const handleLoginFailure = (error: string) => {
		console.error("Login failed:", error);
		setIsLoggedIn(false);
	};

  const handleLogout = async () => {
		try {
			await invoke("netlify_logout");
			setIsLoggedIn(false);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

  return (
    <div className="flex h-screen w-full">
      <DriftSidebar />
      <main className="flex-1 overflow-auto p-4">
        <h1 className="text-xl">
          {selectedPage}
        </h1>
        <hr className="mb-2" />
        {!isLoggedIn ? (
						<LoginButton
							onLoginSuccess={handleLoginSuccess}
							onLoginFailure={handleLoginFailure}
						/>
					) : (
						<Button onClick={handleLogout} className="p-6">
							<LogOut />
						</Button>
					)}
        {selectedPage === "Dashboard" && <Dashboard />}
        {selectedPage === "Posts" && <Posts />}
        {selectedPage === "Edit Post" && <EditPost />}
        {selectedPage === "Create Post" && <CreatePost />}
        {selectedPage === "Profile" && <Profile />}
        {selectedPage === "Settings" && <Settings />}
      </main>
    </div>
  );
}