/// TODO - When at the far left of the screen, the popover sometimes can't be seen for insert link.
import { useState, useEffect, useRef } from "react";
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
import type { Post } from "@/types/post";
import type { PostData } from "@/types/post_data";

interface WebsiteDetails {
	name: string;
	domain: string;
	id: string;
	ssl: boolean;
	url: string;
	screenshot_url?: string;
	password: string;
}

import {
	MDXEditor,
	headingsPlugin,
	listsPlugin,
	quotePlugin,
	thematicBreakPlugin,
	markdownShortcutPlugin,
	codeBlockPlugin,
	codeMirrorPlugin,
	linkPlugin,
	imagePlugin,
	frontmatterPlugin,
	toolbarPlugin,
	diffSourcePlugin,
	linkDialogPlugin,
	UndoRedo,
	BoldItalicUnderlineToggles,
	BlockTypeSelect,
	CodeToggle,
	CreateLink,
	InsertCodeBlock,
	InsertImage,
	InsertThematicBreak,
	ListsToggle,
	type MDXEditorMethods,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

// create site for schema
const formSchema = z.object({
	post_name: z.string().min(1),
});

const MarkdownEditor = ({
	site_id,
	post_id,
	onReturnClick,
}: {
	site_id: string;
	post_id: number;
	onReturnClick: (site_details: string, show_post_list: boolean) => void;
}) => {

	// all for getting site details from disk
	const { toast } = useToast();
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const editMode = post_id !== 0;
	const [postName, setPostName] = useState("");
	const [markdownContent, setMarkdownContent] = useState("");
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
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

	const update_post = async (values: z.infer<typeof formSchema>) => {

		const markdownText = mdxEditorRef.current?.getMarkdown();
		if(!markdownText) {
			alert("Failed to retrieve text from editor :(");
			return;
		}

		setMarkdownContent(markdownText);

		const post_data: PostData = {
			post_id: post_id,
			post_name: values.post_name,
			post_text: markdownText,
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
		const response = await invoke<DriftResponse>("update_post", {
			postData: JSON.stringify(post_data),
			siteData: JSON.stringify(site_data),
		});

		const result = processResponse(response);

		if (result) setIsAlertOpen(true);
		else alert(response.message);
	};

	const create_post = async (values: z.infer<typeof formSchema>) => {

		const markdownText = mdxEditorRef.current?.getMarkdown();
		if(!markdownText) {
			alert("Failed to retrieve text from editor :(");
			return;
		}
		setMarkdownContent(markdownText);

		const post_data: PostData = {
			post_id: post_id,
			post_name: values.post_name,
			post_text: markdownText,
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
		if (editMode){
			update_post(values);
		} else {
			create_post(values);
		}
	}

	async function get_site_details() {
		const response = await invoke<DriftResponse<WebsiteDetails>>(
			"get_site_details",
			{
				siteId: site_id,
			},
		);

		const result = processResponse(response);

		if (result) set_site_details(response.body);
		else alert("Unable to retrieve site details");
	}

	async function get_post_details() {
		form.setValue("post_name", postName);

		const response = await invoke<DriftResponse<Post>>("get_post_details", {
			siteId: site_id,
			postId: post_id,
		});

		const result = processResponse(response);

		if (result) {
			setMarkdownContent(response.body.content);
			setPostName(response.body.title);
			mdxEditorRef.current?.setMarkdown(response.body.content);
		}
		else alert(response.message);

	}

	function confirm_delete(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		setIsDeleteOpen(true);
	}

	async function delete_post() {
		const response = await invoke<DriftResponse>("delete_post", {
			siteId: site_id,
			postName: postName,
		});

		const result = processResponse(response);

		if (result) {
			// if edit mode, navigate back to post list (true), else back to edit site
			if (editMode) {
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
			if (editMode) await get_post_details();
		};

		fetchData();

		return () => {
			mounted = false;
		};
	}, [post_id]);

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
						<AlertDialogTitle>{editMode ? (<>Post Saved!</>) : (<>Post Created!</>)}</AlertDialogTitle>
						<AlertDialogDescription>
							Post "{postName}" has been {editMode ? (<>saved</>) : (<>created</>)}.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<a href="/">
							<AlertDialogAction>Home</AlertDialogAction>
						</a>
						{editMode ? (
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
					{editMode ? (
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
					<hr className="my-4"/>
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
								{editMode ? (
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

				{/* Markdown Editor */}
				<div className={"dark w-full prose max-w-none pb-24"}>
					<MDXEditor
						ref={mdxEditorRef}
						markdown={markdownContent || ""}
						// onChange={(content) => {
						// 	setMarkdownContent(content);
						// }}
						plugins={[
							headingsPlugin(),
							listsPlugin(),
							quotePlugin(),
							thematicBreakPlugin(),
							markdownShortcutPlugin(),
							codeBlockPlugin({defaultCodeBlockLanguage: 'js'}),
							codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS' } }),
							linkPlugin(),
							imagePlugin(),
							frontmatterPlugin(),
							linkDialogPlugin(),
							toolbarPlugin({
								toolbarClassName: "my-classname",
								toolbarContents: () => (
									<>
										{" "}
										<UndoRedo />
										<BoldItalicUnderlineToggles />
										<BlockTypeSelect/>
										<CodeToggle/>
										<CreateLink/>
										<InsertCodeBlock/>
										<InsertImage/>
										<InsertThematicBreak/>
										<ListsToggle/>
									</>
								),
							}),
							diffSourcePlugin(),
						]}
						contentEditableClassName="min-h-[200px] p-4 prose prose-invert max-w-none"
					/>
				</div>
			</div>
		</>
	);
};

export default MarkdownEditor;
