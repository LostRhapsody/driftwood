"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoke } from "@tauri-apps/api/core";
import {
	Check,
	ChevronsUpDown,
	TriangleAlert,
	SquareArrowOutUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn, processResponse, openWiki, templates } from "@/lib/utils";
import openFilePicker from "@/lib/file_picker";

// create site for schema
const formSchema = z.object({
	site_name: z.string().min(1).max(37).regex(/^[a-zA-Z0-9-]+$/, "Only letters, numbers, and dashes are allowed"),
	custom_domain: z.string().max(253),
	favicon_file: z.string(),
	template: z.string().min(1),
	password_enabled: z.boolean().default(false),
	password: z.string(),
	rss_enabled: z.boolean().default(false),
});

export default function CreateSite() {
	const [password_enabled, set_password_enabled] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState(false);
	const [name, setName] = useState("");
	const { toast } = useToast();

	// Create site form defition
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			site_name: "",
			custom_domain: "",
			favicon_file: "",
			template: "default",
			password_enabled: false,
			password: "",
			rss_enabled: false,
		},
	});

	// watch for password_enabled changes
	const watchPassword = form.watch("password_enabled");

	// update the password enabled state (displays the password field)
	useEffect(() => {
		if (watchPassword !== password_enabled) {
			set_password_enabled(watchPassword);
		}
	}, [watchPassword, password_enabled]);

	// send form data to backend
	const create_site = async (new_site: unknown) => {
		const fields = ["success", "title", "description", "name"];
		const newSite = JSON.stringify(new_site);
		try {
			const response = await invoke<string>("create_site", {
				newSite: newSite,
			});

			console.log(response);

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

			setName(name);

			switch (title) {
				case "created":
					toast({
						title: `${name} ${title}`,
						description: description,
					});
					setIsAlertOpen(true);
					refresh_sites();
					break;
			}

			const sites_elemnt = document.getElementById("sites");
			if (sites_elemnt) {
				sites_elemnt.innerHTML = response;
			}
		} catch (err) {
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

				const { success, title, description, name } = err_json;

				setName(name);

				toast({
					title: title,
					description: description,
				});
			}
			console.error(err);
		} finally {
		}
	};

	const refresh_sites = async () => {
		const return_sites = false;
		const response = await invoke<string>("refresh_site", { return_sites });
		const fields = ["success", "title", "description"];
		if (!processResponse(response,fields)) {
			console.error("Could not refresh sites")
		}
	}

	// submit handler for site create form
	function onSubmit(values: z.infer<typeof formSchema>) {
		create_site(values);
	}

	return (
		<div>
			<h1 className="text-4xl pb-2">Create a new site</h1>
			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Site created!</AlertDialogTitle>
						<AlertDialogDescription>
							Your site is now created. Congrats! Time to start building. Select
							from an option below.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<a href="/">
							<AlertDialogAction>Home</AlertDialogAction>
						</a>
						<a href={`/sites/${name}`}>
							<AlertDialogAction>Edit site</AlertDialogAction>
						</a>
						<a href={`/sites/${name}/new_post`}>
							<AlertDialogAction>Add a post</AlertDialogAction>
						</a>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<div className="pb-10">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="site_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Site name</FormLabel>
									<FormControl>
										<Input placeholder="awesome blog" {...field} />
									</FormControl>
									<FormDescription>
										The site name determines the default URL for your site.
										<br />
										Only alphanumeric characters and hyphens are allowed with a
										total character limit of 37.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="custom_domain"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Custom domain</FormLabel>
									<FormControl>
										<Input placeholder="yourdomain.com" {...field} />
									</FormControl>
									<FormDescription>
										A custom domain name that you own. Total character limit of
										253.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="favicon_file"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Favicon</FormLabel>
									<FormControl>
										<Input
											placeholder="C:\Users\you\images\awesome_icon.ico"
											{...field}
										/>
									</FormControl>
									<Button
										onClick={async (e) => {
											e.preventDefault();
											const filePath = await openFilePicker();
											if (filePath) {
												field.onChange(filePath);
											}
										}}
									>
										Upload File
									</Button>
									<FormDescription>
										The favicon (little icon that goes in the browser's tab)
										for your site.
										<br />
										<a
											className="underline"
											href="https://webflow.com/blog/favicon-guide?msockid=1f60439f880f613f1747576c89a66046"
										>
											Click here for an article explaining favicons.
										</a>
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="template"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Template</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														"w-[200px] justify-between",
														!field.value && "text-muted-foreground",
													)}
												>
													{field.value
														? templates.find(
																(template) => template.value === field.value,
															)?.label
														: "Select template"}
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-[200px] p-0">
											<Command>
												<CommandInput placeholder="Search language..." />
												<CommandList>
													<CommandEmpty>No templates found.</CommandEmpty>
													<CommandGroup>
														{templates.map((template) => (
															<CommandItem
																value={template.label}
																key={template.value}
																onSelect={() => {
																	form.setValue("template", template.value);
																}}
															>
																<Check
																	className={cn(
																		"mr-2 h-4 w-4",
																		template.value === field.value
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{template.label}
															</CommandItem>
														))}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>
									<FormDescription>
										This is the template that will be used to create the site.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password_enabled"
							render={({ field }) => (
								<FormItem className="hidden flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Password enabled
										</FormLabel>
										<FormDescription>
											Turn this on to require visitors to use a password to
											enter your site.
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{password_enabled && (
							<div>
								<Alert className="bg-warning-bg text-warning-foreground border-warning-foreground mb-4 hidden">
									<TriangleAlert className="h-4 w-4 stroke-warning-foreground" />
									<AlertTitle className="underline text-lg">
										Passwords require Netlify Pro
									</AlertTitle>
									<AlertDescription>
										To use this option, you're account must have an active
										Netlify Pro subscription.
										<br />
										Learn more at:{" "}
										<Button
											variant={"ghost"}
											className="p-0"
											onClick={(e) => {
												e.preventDefault();
												openWiki("netlify-pro");
											}}
										>
											wiki.driftwood.com&nbsp;
											<SquareArrowOutUpRight />
										</Button>
									</AlertDescription>
								</Alert>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="hidden">
											<FormLabel>Password</FormLabel>
											<FormControl>
												<Input placeholder="super_secret_password" {...field} />
											</FormControl>
											<FormDescription>
												Enter the password visitors will need to access your
												site here.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}
						<FormField
							control={form.control}
							name="rss_enabled"
							render={({ field }) => (
								<FormItem className="hidden flex-row items-center justify-between rounded-lg border p-4">
									<div className="space-y-0.5">
										<FormLabel className="text-base">RSS enabled</FormLabel>
										<FormDescription>
											Turn this on to add an RSS feed to your website.<br/>
											Learn more about RSS at&nbsp;
											<Button
											variant={"ghost"}
											className="p-0"
											onClick={(e) => {
												e.preventDefault();
												openWiki("rss");
											}}
										>
											wiki.driftwood.com&nbsp;
											<SquareArrowOutUpRight />
										</Button>
										</FormDescription>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<Button type="submit">Submit</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}