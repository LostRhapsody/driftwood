"use client";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "@/hooks/use-toast";
import { processResponse } from "@/lib/utils";
import PostCard from "@/components/app_ui/post_card";

type Post = {
	title: string;
	tags: string[];
	date: string;
	image: string;
	filename: string;
	excerpt: string;
};

export default function Posts({
	site,
	onEditClick,
}: { site: string; onEditClick: (post_name: string) => void }) {
	const [data, setData] = useState<Post[] | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		const listPosts = async () => {
			try {
				const response = await invoke<string>("get_post_list", {
					siteId: site,
				});
				const response_json: Post[] = JSON.parse(response);
				console.log(response_json);
				setData(response_json);
			} catch (err) {
				const fields = ["success", "title", "description"];
				// parse the error
				if (typeof err === "string") {
					const err_json = JSON.parse(err);
					// if can't process response (shouldn't happen)
					if (!processResponse(err_json, fields)) {
						toast({
							title: "Uh oh! Something went wrong.",
							description: "There was a problem with your request.",
						});

						return;
					}

					const { success, title, description } = err_json;

					toast({
						title: title,
						description: description,
					});
				}
				console.error(err);
			}
		};
		listPosts();
	}, [site, toast]);

	return (
		<div className="w-full">
			<div className="flex gap-8">
				<h1 className="text-4xl pb-2">Posts</h1>
			</div>
			{data && <PostCard posts={data} onEditClick={onEditClick} />}
		</div>
	);
}
