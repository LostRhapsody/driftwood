"use client";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/app_ui/post_card";
import {
	type DriftResponse,
	processResponse
} from "@/types/response";

import type { Post } from "@/types/post";

export default function Posts({
	site_id,
	onEditClick,
	onReturnClick,
}: { site_id: string; onEditClick: (post_id: number) => void; onReturnClick: (site_id: string) => void; }) {
	const [data, setData] = useState<Post[] | null>(null);

	useEffect(() => {
		const listPosts = async () => {
			const response = await invoke<DriftResponse<Post[]>>("get_post_list", {
				siteId: site_id,
			});

			const result = processResponse(response);
			console.log(response);

			if(result)
				setData(response.body);
			else
				alert(response.message);
		};
		listPosts();
	}, [site_id]);

	return (
		<div className="w-full">
			<div className="flex gap-8">
				<h1 className="text-4xl pb-2">Posts</h1>
			</div>
			{data && <PostCard posts={data} onEditClick={onEditClick} />}
			<div className="flex gap-8">
				<Button onClick={() => onReturnClick(site_id)}>
						Return to site
				</Button>
			</div>
		</div>
	);
}
