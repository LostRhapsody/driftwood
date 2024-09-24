import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useToast } from "@/hooks/use-toast";
import { processResponse } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";

import { open } from "@tauri-apps/plugin-shell";
import {
	List,
	ListOrdered,
	Bold,
	Italic,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	Quote,
	Code,
	Braces,
	Link,
	Image,
	ChevronLeft,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface WebsiteDetails {
	name: string;
	domain: string;
	id?: string;
	ssl: boolean;
	url: string;
	screenshot_url?: string;
	password: string;
}

// create site for schema
const formSchema = z.object({
	post_name: z.string().min(1)
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const MarkdownEditor = ( {site, onReturnClick }: {site: any, onReturnClick: (site_details:string) => void}) => {
	console.log("site: ", site);
	console.log("onReturnClick: ", onReturnClick);

  // all for getting site details from disk
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

  // Create site form defition
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			post_name: "",
		},
	});

  const create_post = async (values: z.infer<typeof formSchema>) => {
    console.log("Creating post");
    console.log("Post values: ", values)
    console.log("Post text: " , markdownText);
    const post_data = {
      "post_name": values.post_name,
      "post_text":markdownText,
    };
    const site_data = {
      "name": site_details.name,
      "domain": site_details.domain,
      "id": site_details.id,
      "ssl": site_details.ssl,
      "url": site_details.url,
      "screenshot_url": site_details.screenshot_url,
      "password": site_details.password
    };
    const response = await invoke<string>(
      "create_post",
      {
        postData: JSON.stringify(post_data),
        siteData: JSON.stringify(site_data)
      }
    );
  }

  // submit handler for site create form
	function onSubmit(values: z.infer<typeof formSchema>) {
		create_post(values);
	}

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

	const [markdownText, setMarkdownText] = useState("");

	const insertAtCursor= (tag: string) => {
		const textarea = document.getElementById("textarea") as HTMLTextAreaElement;
		const selectionStart = textarea?.selectionStart || 0;
		const selectionEnd = textarea?.selectionEnd || 0;
		const placeholder = markdownText.slice(selectionStart, selectionEnd);

		// Store current scorll position to restore later
		const scrollPos = textarea.scrollTop;

		let updatedText = "";
		if (tag === "**" || tag === "*" || tag === "`") {
			updatedText = `${markdownText.slice(0, selectionStart)}${tag}${placeholder}${tag}${markdownText.slice(selectionEnd)}`;
		} else if (tag === "```") {
			updatedText = `${markdownText.slice(0, selectionStart)}${tag}\n${placeholder}\n${tag}\n${markdownText.slice(selectionEnd)}`;
		} else {
			updatedText = `${markdownText.slice(0, selectionStart)}${tag}${placeholder}${markdownText.slice(selectionEnd)}`;
		}

		// having issues with history, ctrl+z, ctrl+y, going to have to setup
		// my own history buffer. That's fine. This doens't fix it.
		textarea.value = updatedText;

		setTimeout(() => {
			textarea.selectionStart = selectionStart + tag.length;
			textarea.selectionEnd = selectionEnd + tag.length;
			// restore scroll pos
			textarea.scrollTop = scrollPos;
		}, 0);

		// setMarkdownText(updatedText);
	};

	const toolbarButtons = [
		{
			tooltip: "Bold text, ctrl+b",
			id: "bold",
			label: <Bold />,
			tag: "**",
			shortcut: "ctrl+b",
		},
		{
			tooltip: "Italicize text, ctrl+i",
			id: "italic",
			label: <Italic />,
			tag: "*",
			shortcut: "ctrl+i",
		},
		{
			tooltip: "Insert heading 1, right click for more options, ctrl+1",
			id: "heading1",
			label: <Heading1 />,
			tag: "# ",
			shortcut: "ctrl+1",
		},
		{
			tooltip: "Ordered list, ctrl+shift+o",
			id: "ol",
			label: <ListOrdered />,
			tag: "1.",
			shortcut: "ctrl+shift+o",
		},
		{
			tooltip: "Unordered list, ctrl+shift+u",
			id: "ul",
			label: <List />,
			tag: "-",
			shortcut: "ctrl+shift+u",
		},
		{
			tooltip: "Insert quote, ctrl+shift+q",
			id: "quote",
			label: <Quote />,
			tag: "> ",
			shortcut: "ctrl+shift+q",
		},
		{
			tooltip: "Insert inline code, ctrl+shift+c",
			id: "code",
			label: <Code />,
			tag: "`",
			shortcut: "ctrl+shift+c",
		},
		{
			tooltip: "Insert codeblock, ctrl+shift+b",
			id: "codeblock",
			label: <Braces />,
			tag: "```",
			shortcut: "ctrl+shift+b",
		},
		{
			tooltip: "Insert link, ctrl+k",
			id: "link",
			label: <Link />,
			tag: "[Link Text](http://)",
			shortcut: "ctrl+k",
		},
		{
			tooltip: "Insert image, ctrl+shift+i",
			id: "image",
			label: <Image />,
			tag: "![Alt Text](http://)",
			shortcut: "ctrl+shift+i",
		},
	];

	const headers = [
		{
			tooltip: "Insert Heading 1",
			id: "heading1",
			label: <Heading1 />,
			tag: "# ",
		},
		{
			tooltip: "Insert Heading 2",
			id: "heading2",
			label: <Heading2 />,
			tag: "# ",
		},
		{
			tooltip: "Insert Heading 3",
			id: "heading3",
			label: <Heading3 />,
			tag: "# ",
		},
		{
			tooltip: "Insert Heading 4",
			id: "heading4",
			label: <Heading4 />,
			tag: "# ",
		},
		{
			tooltip: "Insert Heading 5",
			id: "heading5",
			label: <Heading5 />,
			tag: "# ",
		},
		{
			tooltip: "Insert Heading 6",
			id: "heading6",
			label: <Heading6 />,
			tag: "# ",
		},
	];

	const shortcuts = [
		{ shortcut: "ctrl+b", tag: "**" }, // Bold
		{ shortcut: "ctrl+i", tag: "*" }, // Italic
		{ shortcut: "ctrl+1", tag: "# " }, // Heading 1
		{ shortcut: "ctrl+2", tag: "## " }, // Heading 2
		{ shortcut: "ctrl+3", tag: "### " }, // Heading 3
		{ shortcut: "ctrl+4", tag: "#### " }, // Heading 4
		{ shortcut: "ctrl+5", tag: "##### " }, // Heading 5
		{ shortcut: "ctrl+6", tag: "###### " }, // Heading 6
		{ shortcut: "ctrl+shift+o", tag: "1." }, // Ordered list
		{ shortcut: "ctrl+shift+u", tag: "-" }, // Unordered list
		{ shortcut: "ctrl+shift+q", tag: "> " }, // Quote
		{ shortcut: "ctrl+shift+c", tag: "`" }, // Inline code
		{ shortcut: "ctrl+shift+b", tag: "```" }, // Code block
		{ shortcut: "ctrl+k", tag: "[Link Text](http://)" }, // Link
		{ shortcut: "ctrl+shift+i", tag: "![Alt Text](http://)" }, // Image
	];

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const setupKeyboardShortcuts = (shortcuts: any) => {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const handleShortcut = (e: any) => {
			// biome-ignore lint/complexity/noForEach: <explanation>
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			shortcuts.forEach((button: any) => {
				const keys = button.shortcut.split("+");
				const ctrlKey = keys.includes("ctrl");
				const shiftKey = keys.includes("shift");
				const key = keys[keys.length - 1].toLowerCase();
				if (
					e.ctrlKey === ctrlKey &&
					e.shiftKey === shiftKey &&
					e.key.toLowerCase() === key
				) {
					e.preventDefault();
					insertAtCursor(button.tag);
				}
			});
		};

		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		useEffect(() => {
			document.addEventListener("keydown", handleShortcut);
			return () => {
				document.removeEventListener("keydown", handleShortcut);
			};
		}, [shortcuts]);
	};

	setupKeyboardShortcuts(shortcuts);

	return (
		<div className="w-full">

      {/* Post details form */}
      <div className="w-full bg-primary rounded-xl p-2 mb-4">
        <p className="text-xl">Site: {site_details.name}</p>
				<Button className="mt-4" variant={"outline"} onClick={() => onReturnClick(site_details.id)}>
					<ChevronLeft />&nbsp;Return to Edit site
				</Button>
      </div>

			{/* Toolbar */}
			<div className="w-full flex justify-center space-x-2 mb-4 bg-primary rounded-xl p-2">
				{toolbarButtons.map((btn) => (
					<TooltipProvider key={btn.id} delayDuration={200}>
						<Tooltip>
							<TooltipTrigger>
								{btn.id === "heading1" ? (
									<ContextMenu>
										<ContextMenuTrigger>
											<Button
												variant={"outline"}
												onClick={() => insertAtCursor(btn.tag)}
											>
												{btn.label}
											</Button>
										</ContextMenuTrigger>
										<ContextMenuContent className="dark">
											{headers.map((heading) => (
												<ContextMenuItem key={heading.id}>
													<Button
														variant={"outline"}
														onClick={() => insertAtCursor(heading.tag)}
														className=""
													>
														{heading.label}
													</Button>
													<p className="">&nbsp;{heading.tooltip}</p>
												</ContextMenuItem>
											))}
										</ContextMenuContent>
									</ContextMenu>
								) : (
									<Button
										variant={"outline"}
										onClick={() => insertAtCursor(btn.tag)}
									>
										{btn.label}
									</Button>
								)}
							</TooltipTrigger>
							<TooltipContent>{btn.tooltip}</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				))}
			</div>

			{/* Main Editor and Preview Area */}
			<div className="grid grid-cols-2 gap-4">
				{/* Textarea */}
				<ReactTextareaAutosize
					minRows={6}
					value={markdownText}
					onChange={(e) => setMarkdownText(e.target.value)}
					className="w-full p-4 bg-transparent text-white border border-gray-600 rounded-md"
					placeholder="Write your markdown here..."
					id="textarea"
				/>

				{/* Preview */}
				<div className="w-full p-4 border border-gray-600 rounded-md markdown">
					<ReactMarkdown
						components={{
							a: ({ href, children }) => (
								<Button
									onClick={(e) => {
										if (href) {
											open(href);
										}
									}}
									style={{
										color: "#1e90ff",
										textDecoration: "underline",
										backgroundColor: "transparent",
										padding: "0",
									}}
								>
									{children}
								</Button>
							),
						}}
					>
						{markdownText}
					</ReactMarkdown>
				</div>
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
									<FormDescription>
										The name of the post
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
          <Button className="dark" type="submit">Create post</Button>
        </form>
        </Form>
      </div>
		</div>
	);
};

export default MarkdownEditor;