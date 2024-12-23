"use client";
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
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";
import type { Site } from "@/types/site";

const menu = [
	{
		title: "Dashboard",
		url: "/",
		icon: PanelsTopLeft,
	},
	{
		title: "Posts",
		url: "/posts",
		icon: Book,
	},
	{
		title: "Settings",
		url: "/settings",
		icon: Settings,
	},
];

export function DriftSidebar({
	className,
	selectedSite,
	setSelectedSite,
	sitesData,
}: React.ComponentProps<typeof Sidebar> & {
	selectedSite: Site;
	setSelectedSite: (site: Site) => void;
	sitesData: Site[];
}) {
	return (
		<Sidebar>
			<SidebarHeader>
				<a href="/">
					<AnimatedGradientText className="mb-4 text-2xl text-center w-5/6 max-w-full">
						<span
							className={cn(
								"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent w-full",
							)}
						>
							Drift
						</span>
					</AnimatedGradientText>
				</a>
				<Select
					value={selectedSite.id}
					onValueChange={(value) => {
						const site = sitesData.find((site) => site.id === value);
						if (site) setSelectedSite(site);
					}}
				>
					<SelectTrigger className="w-3/4 mx-auto">
						<SelectValue placeholder="Select a site" />
					</SelectTrigger>
					<SelectContent>
						{sitesData && (
							sitesData.map((site) => (
								<SelectItem key={site.id} value={site.id}>
									{site.name}
								</SelectItem>
							)))}
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
									<SidebarMenuButton className="h-full" asChild>
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
				<a href="/profile" className="w-full">
					<Button variant="outline" className="w-full">
						<User />
						Profile
					</Button>
				</a>
			</SidebarFooter>
		</Sidebar>
	);
}
