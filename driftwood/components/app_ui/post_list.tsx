"use client";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { processResponse } from "@/lib/utils";

type Site = {
	name: string;
	domain: string;
	id: string;
	ssl: boolean;
	url: string;
	screenshot_url: string;
	required: string;
};

export default function Posts({ site }: { site: string }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<Site[] | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		const listPosts = async() => {
			try{
				const response = await invoke<string>("get_post_list", {siteId: site});
				const response_json = JSON.parse(response);

				// TODO - load post data into component and display in body
				console.log(response_json[0].title);
				console.log(response_json[0].date);
				console.log(response_json[0].tags);
				console.log(response_json[0].image);
				console.log(response_json[0].content);

			} catch(err){
					const fields = ["success","title","description"];
					// parse the error
					if (typeof err === "string") {
						const err_json = JSON.parse(err);
						// if can't process response (shouldn't happen)
						if (!processResponse(err_json,fields)) {
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
		}
		listPosts();
	}, [site,toast]);

	const handleRefresh = async () => {
		console.log("Refreshing sites");
		const return_sites = true;
		try {
			const response = await invoke<string>("refresh_sites", {
				returnSite: return_sites,
			});

			// Parse and set the site data
			const parsedData: Site[] = JSON.parse(response);
			setData(parsedData);

			toast({
				title: "Sites Refreshed",
				description: "Sites successfully retrieved from Netify",
			});
		} catch (error) {
			toast({
				title: "Uh oh! Something went wrong.",
				description: `Error: ${error}`,
			});
		}
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="w-full">
			<div className="flex gap-8">
				<h1 className="text-4xl pb-2">Posts</h1>
				<Button onClick={handleRefresh}>
					<RotateCw color="#ffff" />
				</Button>
			</div>
		</div>
	);
}
