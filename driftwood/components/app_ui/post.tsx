// TODO - Submit doesn't grab text from markdown editor yet
import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { ChevronLeft } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { type DriftResponse, processResponse } from "@/types/response";

interface WebsiteDetails {
	name: string;
	domain: string;
	id?: string;
	ssl: boolean;
	url: string;
	screenshot_url?: string;
	password: string;
}

import type { Post } from "@/types/post";

// create site for schema
const formSchema = z.object({
	post_name: z.string().min(1),
});

const EditorComp = dynamic(() => import("@/components/app_ui/editor"), {
	ssr: false,
});

const markdown = `
Hello **world**!
`;

const MarkdownEditor = ({
	site,
	post_name,
	onReturnClick,
}: {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	site: any;
	post_name: string;
	onReturnClick: (site_details: string, show_post_list: boolean) => void;
}) => {
	/// TODO - if post_name is present, retrieve post details from disk
	/// TODO - if post_name is present, return to post list, not edit site.
	console.log("site: ", site);
	console.log("post_name: ", post_name);
	console.log("onReturnClick: ", onReturnClick);

	// all for getting site details from disk
	const { toast } = useToast();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [postName, setPostName] = useState("");
	const [markdownContent, setMarkdownContent] = useState(markdown || '');
	const [site_details, set_site_details] = useState<WebsiteDetails>({
		name: "",
		domain: "",
		id: "",
		ssl: true,
		url: "",
		screenshot_url: "",
		password: "",
	});

	// Create site form defition
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	});

	const create_post = async (values: z.infer<typeof formSchema>) => {
		console.log("Creating post");
		console.log("Post values: ", values);
		console.log("Post text: ", markdownContent);
		const post_data = {
			post_name: values.post_name,
			post_text: markdownContent,
		};

		setPostName(post_data.post_name);

		const site_data = {
			name: site_details.name,
			domain: site_details.domain,
			id: site_details.id,
			ssl: site_details.ssl,
			url: site_details.url,
			screenshot_url: site_details.screenshot_url,
			password: site_details.password,
		};
		const response = await invoke<DriftResponse>("create_post", {
			postData: JSON.stringify(post_data),
			siteData: JSON.stringify(site_data),
		});

		const result = processResponse(response);

		if (result) setIsAlertOpen(true);
		else alert(response.message);
	};

	// submit handler for site create form
	function onSubmit(values: z.infer<typeof formSchema>) {
		create_post(values);
	}

	async function get_site_details() {
		const response = await invoke<DriftResponse<WebsiteDetails>>(
			"get_site_details",
			{
				siteId: site,
			},
		);

		const result = processResponse(response);

		if (result) set_site_details(response.body);
		else alert("Unable to retrieve site details");
	}

	async function get_post_details() {
		setPostName(post_name);
		console.log(form);
		form.setValue("post_name", postName);

		const response = await invoke<DriftResponse<Post>>("get_post_details", {
			siteId: site,
			postName: post_name,
		});

		const result = processResponse(response);

		if (result) setMarkdownContent(response.body.content);
		else alert(response.message);
	}

	function confirm_delete(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		setIsDeleteOpen(true);
	}

	async function delete_post() {
		const response = await invoke<DriftResponse>("delete_post", {
			siteId: site,
			postName: postName,
		});

		const result = processResponse(response);

		if (result) {
			// navigate back to post list or edit site
			if (post_name !== "") {
				onReturnClick(site_details.id, true);
			} else {
				onReturnClick(site_details.id, false);
			}
		} else {
			alert(response.message);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		let mounted = true;

		const fetchData = async () => {
			if (!mounted) return;

			await get_site_details();
			if (post_name !== "") await get_post_details();
		};

		fetchData();

		return () => {
			mounted = false;
		};
	}, [post_name]);

	// Update form defaults when post_name changes
	useEffect(() => {
		if (postName) {
			form.reset({
				post_name: postName,
			});
		}
	}, [postName, form]);

	return (
		<>
			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Post created!</AlertDialogTitle>
						<AlertDialogDescription>
							Post "{postName}" has been created.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<a href="/">
							<AlertDialogAction>Home</AlertDialogAction>
						</a>
						{postName !== "" ? (
							<AlertDialogAction
								onClick={() => onReturnClick(site_details.id, true)}
							>
								Return to post list
							</AlertDialogAction>
						) : (
							<AlertDialogAction
								onClick={() => onReturnClick(site_details.id, false)}
							>
								Return to edit site
							</AlertDialogAction>
						)}
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Post?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete "{postName}"? There is no backup
							in place!
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button onClick={delete_post}>Yes, delete {postName}.</Button>
						<Button onClick={() => setIsDeleteOpen(false)}>Nevermind!</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div className="w-full">
				{/* Post details form */}
				<div className="w-full bg-primary rounded-xl p-2 mb-4">
					<p className="text-xl">Site: {site_details.name}</p>
					{postName !== "" ? (
						<Button
							className="mt-4"
							variant={"outline"}
							onClick={() => onReturnClick(site_details.id, true)}
						>
							<ChevronLeft />
							&nbsp;Return to Post list
						</Button>
					) : (
						<Button
							className="mt-4"
							variant={"outline"}
							onClick={() => onReturnClick(site_details.id, false)}
						>
							<ChevronLeft />
							&nbsp;Return to Edit site
						</Button>
					)}
				</div>

				{/* Markdown Editor */}
				<div className="dark" style={{ border: "1px solid black" }}>
					<Suspense fallback={null}>
						<EditorComp markdown={markdown} />
					</Suspense>
				</div>

				{/* Submit post */}
				<div className="w-full bg-primary rounded-xl p-2 mt-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="post_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Post name</FormLabel>
										<FormControl>
											<Input placeholder="new post" {...field} />
										</FormControl>
										<FormDescription>The name of the post</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className="dark" type="submit">
								{postName !== "" ? (
									<span>Save post</span>
								) : (
									<span>Create post</span>
								)}
							</Button>
							<Button
								className="dark ms-4"
								onClick={confirm_delete}
								variant="destructive"
							>
								Delete Post
							</Button>
						</form>
					</Form>
				</div>
			</div>
		</>
	);
};

export default MarkdownEditor;
