"use client";
import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import SitesList from "@/components/app_ui/site_card";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
	type DriftResponse,
	processResponse
} from "@/types/response";

import type { Site } from "@/types/site";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function Sites(onEditClick:any) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<Site[] | null>(null);
	const { toast } = useToast();

	useEffect(() => {
		const loadSites = async () => {
			const response = await invoke<DriftResponse<Site[]>>("list_sites");

			const result = processResponse(response);

			if(result)
				setData(response.body);
			else
				setError("Failed to load sites");

			setLoading(false);
		};

		loadSites();
	}, []);

  const handleRefresh = async () => {
		console.log("Refreshing sites");
		const return_sites = true;

		const response = await invoke<DriftResponse<Site[]>>("refresh_sites", { returnSite:return_sites });
		const result = processResponse(response);

		// Parse and set the site data
		const parsedData: Site[] = response.body;
		setData(parsedData);

		toast({
			title: "Sites Refreshed",
			description: "Sites successfully retrieved from Netify",
		});

  };

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;

	return (
		<div className="w-full">
			<div className="flex gap-8">
				<h1 className="text-4xl pb-2">Your sites</h1>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button onClick={handleRefresh}>
								<RotateCw color="#ffff" />
							</Button>
						</TooltipTrigger>
						<TooltipContent>Refresh sites list</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			{/* Ensure data is not null before passing to SitesList */}
			{data && <SitesList sites={data} onEditClick={onEditClick.onEditClick} />}
		</div>
	);
}
