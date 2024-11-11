"use client";
import { useState, useEffect } from "react";
import { type DriftResponse, processResponse } from "@/types/response";
import Sites from "@/components/app_ui/sites";
import CreateSite from "@/components/app_ui/create_site";
import EditSite from "@/components/app_ui/edit_site";
import CreatePost from "@/components/app_ui/post";
import Posts from "@/components/app_ui/post_list";
import LoginButton from "@/components/app_ui/login_button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { invoke } from "@tauri-apps/api/core";
import { AlignLeft, Globe, House, Bug, LogOut } from "lucide-react";

import { Toaster } from "@/components/ui/toaster";

export default function Home() {
	const [hasToken, setHasToken] = useState(true);
	const [currentPage, setCurrentPage] = useState("home");
	const [currentSite, setCurrentSite] = useState("");
	const [currentPost, setCurrentPost] = useState("");

	const handleEditSite = (site_id: string) => {
		console.log("Edit Site id: ", site_id);
		setCurrentPage("edit");
		setCurrentSite(site_id);
		setCurrentPost("");
	};

	const handleReturnClick = () => {
		console.log("Returning to sites list");
		setCurrentPage("sites");
		setCurrentSite("");
		setCurrentPost("");
	};

	const handlePostReturnClick = (site_id: string) => {
		console.log("Returning to edit site");
		setCurrentPage("edit");
		setCurrentSite(site_id);
		setCurrentPost("");
	};

	const handleViewPostsClick = (site_id: string) => {
		console.log("List posts for site: ", site_id);
		setCurrentPage("list_posts");
		setCurrentSite(site_id);
		setCurrentPost("");
	};

	const handleAddPostClick = (site_id: string) => {
		console.log("Add post Site id: ", site_id);
		setCurrentPage("post");
		setCurrentSite(site_id);
		setCurrentPost("");
	};

	const handlePostEditClick = (post_name:string) => {
		console.log("Editing post: ", post_name);
		setCurrentPage("post");
		setCurrentPost(post_name);
	}

	const renderContent = () => {
		switch (currentPage) {
			case "home":
				return (
					<div className="flex gap-8 justify-center items-center w-full">
						<Button
							className="w-40 h-40 flex flex-col gap-4"
							onClick={() => handleNavigation("create_site")}
						>
							<Globe size={64} />
							<p>Create new site</p>
						</Button>
						<Button
							className="w-40 h-40 flex flex-col gap-4"
							onClick={() => handleNavigation("sites")}
						>
							<AlignLeft size={64} />
							<p>List your sites</p>
						</Button>
					</div>
				);
			case "sites":
				return <Sites onEditClick={handleEditSite} />;
			case "create_site":
				return <CreateSite />;
			case "edit":
				return (
					<EditSite
						site={currentSite}
						onReturnClick={handleReturnClick}
            onViewPostsClick={handleViewPostsClick}
						onAddPostClick={handleAddPostClick}
					/>
				);
			case "post":
				return (
					<CreatePost
						site={currentSite}
						post_name={currentPost}
						onReturnClick={handlePostReturnClick}
					/>
				);
			case "list_posts":
				return <Posts site={currentSite} onEditClick={handlePostEditClick} />;
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

	const handleLoginFailure = (error: string) => {
		console.error("Login failed:", error);
		setHasToken(false);
	};

	const handleLogout = async () => {
		try {
			await invoke("netlify_logout");
			setHasToken(false);
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	useEffect(() => {
		const checkToken = async () => {
			const response = await invoke<DriftResponse>("check_token");
			const result = processResponse(response);
			setHasToken(result);
		};

		checkToken();
	}, []);

	return (
		<div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
			<div className="flex relative">
				<header className="flex flex-col gap-6 p-2 fixed overflow-y-auto z-10 bg-zinc-800 h-[100vh]">
					{!hasToken ? (
						<LoginButton
							onLoginSuccess={handleLoginSuccess}
							onLoginFailure={handleLoginFailure}
						/>
					) : (
						<Button onClick={handleLogout} className="p-6">
							<LogOut />
						</Button>
					)}
					<Button
						className="text-xl p-6"
						onClick={() => handleNavigation("home")}
					>
						<House />
					</Button>
					<Link href="404">
						<Button className="text-xl p-6 w-full">
							<Bug />
						</Button>
					</Link>
				</header>
				<main className="ml-[5.5rem] h-[100vh] gap-8 flex flex-row p-8 w-full">
					{!hasToken ? (
						<div className="w-full flex flex-col justify-center items-center">
							<h1 className="text-7xl">Driftwood</h1>
							<p className="text-xl">Static blog generator</p>
							<p className="text-xl">
								Please log in to Netlify to continue (top left)
							</p>
						</div>
					) : (
						<>{renderContent()}</>
					)}
				</main>
				<Toaster />
			</div>
		</div>
	);
}
