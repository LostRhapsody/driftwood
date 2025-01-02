"use client";
import { useEffect, useState } from "react";
import { useSelectedSite } from "@/contexts/SelectedSiteContext";
import { invoke } from "@tauri-apps/api/core";
import { type DriftResponse, processResponse } from "@/types/response";
import StatCard from "@/components/app_ui/DashboardCard";
import { open } from "@tauri-apps/plugin-shell";
import RecentPosts from "@/components/app_ui/post_grid";
import type { Post } from "@/types/post";

export default function dashboard({ setCurrentPage }:{
	setCurrentPage: (page: string) => void,
}) {
  const { selectedSite } = useSelectedSite();
  const [postCount, setPostCount] = useState(0);
  const [deployUrl, setDeployUrl] = useState("");
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {deployUrl !== "" && <StatCard type="deployStat" onClick={() => { }} value={deployUrl} />}
        <StatCard type="posts" onClick={() => { }} value={postCount} />
        <StatCard type="visit" onClick={handleVisit} value={null} />
        <StatCard type="deploySite" onClick={() => { }} value={null} />
        <StatCard type="newPost" onClick={() => { setCurrentPage("EditPost") }} value={null} />
      </div>
      <div className="my-8">
        <h1 className="text-lg">Recent Posts</h1>
        <hr className="mb-2" />
        <RecentPosts posts={recentPosts} onEdit={() => {}} onDelete={() => {}} />
      </div>
    </div>
  );
}