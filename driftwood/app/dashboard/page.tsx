"use client";
import { useEffect, useState } from "react";
import { useSelectedSite } from "@/contexts/SelectedSiteContext";
import { useSelectedPage } from "@/contexts/SelectedPageContext";
import { invoke } from "@tauri-apps/api/core";
import { type DriftResponse, processResponse } from "@/types/response";
import StatCard from "@/components/app_ui/DashboardCard";
import { open } from "@tauri-apps/plugin-shell";
import RecentPosts from "@/components/app_ui/post_grid";
import type { Post } from "@/types/post";

export default function dashboard() {
	const { setSelectedPage } = useSelectedPage();
  const { selectedSite } = useSelectedSite();
  const [postCount, setPostCount] = useState(0);
  const [deployUrl, setDeployUrl] = useState("");
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleVisit = async () => {
    if (selectedSite?.url) {
      await open(selectedSite.url);
    }
  };

  const handleNewPost = async () => {
    if (selectedSite) {
      // TODO - implement
      alert("Not implemented");
    }
  }

  // things that happen just once on page load
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // things that happen every time the site is changed
  useEffect(() => {

    const loadPostCount = async () => {
      if (!selectedSite) return;
      const response = await invoke<DriftResponse<number>>("get_post_count", { siteId: selectedSite.id });
      const result = processResponse(response);
      if (result) {
        setPostCount(response.body);
      } else {
        alert("Failed to load post count");
      }
    }

    loadPostCount();

    const loadRecentPosts = async () => {
      if (!selectedSite) return;
      const response = await invoke<DriftResponse<Post[]>>("get_recent_posts", { siteId: selectedSite.id });
      const result = processResponse(response);
      if (result) {
        setRecentPosts(response.body);
      } else {
        alert("Failed to load recent posts");
      }
    }

    loadRecentPosts();

    if (selectedSite) {
      setDeployUrl(`https://api.netlify.com/api/v1/badges/${selectedSite.id}/deploy-status`);
    }
  }, [selectedSite]);

  return (
    <div className="items-center justify-center">

      {isLoaded ?
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard colors={["#3B82F6", "#60A5FA", "#93C5FD"]} type="deployStat" onClick={() => { }} value={deployUrl} />
          <StatCard colors={["#10B981", "#34D399", "#6EE7B7"]} type="posts" onClick={() => { }} value={postCount} />
          <StatCard colors={["#8B5CF6", "#A78BFA", "#C4B5FD"]} type="visit" onClick={handleVisit} value={null} />
          <StatCard colors={["#F59E0B", "#FBBF24", "#FCD34D"]} type="deploySite" onClick={() => { }} value={null} />
          <StatCard colors={["#EC4899", "#F472B6", "#FBCFE8"]} type="newPost" onClick={() => setSelectedPage("Create Post")} value={null} />
        </div>
      :
        <p>Loading...</p>
      }

      <div className="my-8">
        <h1 className="text-lg">Recent Posts</h1>
        <hr className="mb-2" />
        <RecentPosts posts={recentPosts} />
      </div>
    </div>
  );
}