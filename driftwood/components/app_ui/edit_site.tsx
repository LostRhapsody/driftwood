"use client";
import { useForm } from "react-hook-form";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { processResponse } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, SquareArrowOutUpRight, PencilLine, Rocket} from "lucide-react";
import { z } from "zod";

const websiteSchema = z.object({
	name: z.string().min(1, "Website name is required"),
	domain: z.string(),
	id: z.string().optional(),
	ssl: z.boolean(),
	url: z.string().url("Invalid URL format"),
	screenshot_url: z.string().url("Invalid screenshot URL format").optional(),
	password: z.string(),
});

interface WebsiteDetails {
	name: string;
	domain: string;
	id: string;
	ssl: boolean;
	url: string;
	screenshot_url?: string;
	password: string;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function EditSite({ site, onReturnClick, onAddPostClick }: { site: any, onReturnClick: () => void, onAddPostClick: (site_id:string) => void }) {
	console.log("onReturnClick: " ,onReturnClick);
	console.log("site id: " ,site);

	const { toast } = useToast();
	const [site_details, set_site_details] = useState<WebsiteDetails>({
		name: "",
		domain: "",
		id: "",
		ssl: true,
		url: "",
		screenshot_url: "",
		password: "",
	});

	async function get_site_details() {
		const fields = [
			"name",
			"domain",
			"id",
			"ssl",
			"url",
			"screenshot_url",
			"password",
		];
		const response = await invoke<string>("get_site_details", {
			siteId: site,
		});

		console.log(response);

		// validate we got a response back
		const response_json = JSON.parse(response);

		// if can't process response (shouldn't happen)
		if (!processResponse(response_json, fields)) {
			toast({
				title: "Uh oh! Something went wrong.",
				description:
					"There was a problem with your request, could not retrieve site details.",
			});
			return;
		}

		set_site_details(response_json);
		console.log(response_json);
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		get_site_details();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset, // Add reset function from useForm
	} = useForm<WebsiteDetails>({
		resolver: zodResolver(websiteSchema),
		defaultValues: site_details,
	});

	// Effect to reset form when site_details is updated
	useEffect(() => {
		reset(site_details);  // Reset form fields when site_details changes
	}, [site_details, reset]);


	const onSubmit = (data: WebsiteDetails) => {
		set_site_details(data); // Update site_details with form data
		console.log("Form Data:", data);
		update_site(data);
	};

	const update_site = async (data: WebsiteDetails) => {
		const fields = ["success","title","description","name"];

		const response = await invoke<string>("update_site", {site:JSON.stringify(data)});

		// validate we got a response back
		const response_json = JSON.parse(response);

		// if can't process response (shouldn't happen)
		if (!processResponse(response_json,fields)) {
			toast({
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
			});
			return;
		}

		const { success, title, description, name } = response_json;
		if (success) {
			toast({
				title: `${name} ${title}`,
				description: description,
			});
		} else {
			toast({
				title: title,
				description: description,
			});
			console.error("Failed to update site");
		}

	}

	const deploy_site = async() => {

		const fields = ["success","title","description"];

		const response = await invoke<string>("deploy_site", {siteId:site_details.id});

		// validate we got a response back
		const response_json = JSON.parse(response);

		// if can't process response (shouldn't happen)
		if (!processResponse(response_json,fields)) {
			toast({
				title: "Uh oh! Something went wrong.",
				description: "There was a problem with your request.",
			});
			return;
		}

		const { success, title, description, name } = response_json;
		if (success) {
			toast({
				title: `${title}`,
				description: description,
			});
		} else {
			toast({
				title: title,
				description: description,
			});
			console.error("Failed to deploy site");
		}

	}


	const handleDelete = () => {
    // Handle delete action
    alert('Are you sure you want to delete this website?');
  };

	return (
		<div>
			<h1 className="text-4xl pb-2">Update {site_details.name}</h1>
			<div className="flex flex-row gap-8">
			<Button onClick={() => onAddPostClick(site_details.id)} className="w-52">
				<PencilLine />&nbsp;Add Post
			</Button>
			<Button variant={"success"} onClick={deploy_site} className="w-52">
				<Rocket />&nbsp;Deploy site
			</Button>
			</div>
			<div className="flex flex-row gap-8">
			<Button onClick={ () => {open(site_details.url)}} className="mt-4 w-52">
				<SquareArrowOutUpRight />&nbsp;Visit site
			</Button>
			<Button onClick={onReturnClick} className="mt-4 w-52">
				<ChevronLeft />&nbsp;Return to sites list
			</Button>
			</div>
			<div className="pb-10">
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4 p-6 shadow-md rounded-lg dark"
				>
					<Card className="edit_card">
						<Label>Website Name</Label>
						<Input
							{...register("name")}
							placeholder="Website Name"
							className="edit_input"
						/>
						{errors.name && (
							<p className="text-red-500">{errors.name.message}</p>
						)}
					</Card>

					<Card className="edit_card">
						<Label>Domain</Label>
						<Input
							{...register("domain")}
							placeholder="Domain"
							className="edit_input"
						/>
						{errors.domain && (
							<p className="text-red-500">{errors.domain.message}</p>
						)}
					</Card>

					<Card className="edit_card">
						<Label>SSL Enabled</Label><br />
						<Checkbox {...register("ssl")} />
					</Card>

					<Card className="edit_card">
						<Label>URL</Label>
						<Input
							{...register("url")}
							placeholder="Website URL"
							className="edit_input"
						/>
						{errors.url && <p className="text-red-500">{errors.url.message}</p>}
					</Card>

					<Card className="edit_card">
						<Label>Screenshot</Label>
						{site_details.screenshot_url ? (
							<img
								src={site_details.screenshot_url}
								alt="Website Screenshot"
								className="w-full h-full object-cover rounded-lg mb-4"
							/>
						) : (
							<Input
								{...register("screenshot_url")}
								placeholder="Screenshot URL"
								className="edit_input"
							/>
						)}
						{errors.screenshot_url && (
							<p className="text-red-500">{errors.screenshot_url.message}</p>
						)}
					</Card>

					<Card className="edit_card">
						<Label>Password</Label>
						<Input
							type="password"
							{...register("password")}
							placeholder="Password"
							className="edit_input"
						/>
						{errors.password && (
							<p className="text-red-500">{errors.password.message}</p>
						)}
					</Card>

					<div className="flex justify-between">
						<Button type="submit" className="edit_button edit_save">
							Save Changes
						</Button>
						<Button type="button" className="edit_button edit_delete" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
