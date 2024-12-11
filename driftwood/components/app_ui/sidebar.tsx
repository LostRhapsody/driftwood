"use client";
import * as React from "react";
import { PanelsTopLeft, Book, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarFooter,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import ShinyButton from "@/components/ui/shiny-button";
// This is a placeholder for your sites data
const sitesData = [
	{ id: "1", name: "Site 1" },
	{ id: "2", name: "Site 2" },
	{ id: "3", name: "Site 3" },
];

const menu = [
	{
		title: "Dashboard",
		url: "#",
		icon: PanelsTopLeft,
	},
	{
		title: "Posts",
		url: "#",
		icon: Book,
	},
	{
		title: "Settings",
		url: "#",
		icon: Settings,
	},
];

export function DriftSidebar({
	className,
}: React.ComponentProps<typeof Sidebar>) {
	const [selectedSite, setSelectedSite] = React.useState(sitesData[0].id);

	return (
		<Sidebar>
			<SidebarHeader>
				<h1 className="mb-4 text-2xl">Drift</h1>
				<Select>
					<SelectTrigger className="w-3/4 mx-auto">
						<SelectValue placeholder="Select a site" />
					</SelectTrigger>
					<SelectContent>
						{sitesData.map((site) => (
							<SelectItem key={site.id} value={site.id}>
								{site.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</SidebarHeader>
			<hr className="my-2" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menu.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
									className="h-full"
										asChild>
										<a href={item.url}>
												<item.icon />
												<span className="ms-4">{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<Button variant="outline">
					<User />
					Profile
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
