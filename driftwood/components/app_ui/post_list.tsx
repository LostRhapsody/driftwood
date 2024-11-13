"use client";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/app_ui/post_card";
import {
	type DriftResponse,
	processResponse
} from "@/types/response";

import type {Post} from "@/types/post";

export default function Posts({
	site,
	onEditClick,
}: { site: string; onEditClick: (post_name: string) => void }) {
	const [data, setData] = useState<Post[] | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		const listPosts = async () => {
			const response = await invoke<DriftResponse<Post[]>>("get_post_list", {
				siteId: site,
			});

			const result = processResponse(response);

			if(result)
				setData(response.body);
			else
				alert(response.message);
		};
		listPosts();
	}, [site]);

	return (
		<div className="w-full">
			<div className="flex gap-8">
				<h1 className="text-4xl pb-2">Posts</h1>
			</div>
			{data && <PostCard posts={data} onEditClick={onEditClick} />}
		</div>
	);
}
