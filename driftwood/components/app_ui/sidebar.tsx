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
import { useSelectedSite } from "@/contexts/SelectedSiteContext";

const menu = [
	{
		title: "Dashboard",
		icon: PanelsTopLeft,
	},
	{
		title: "Posts",
		icon: Book,
	},
	{
		title: "Settings",
		icon: Settings,
	},
];

export function DriftSidebar({ className, setCurrentPage }: React.ComponentProps<typeof Sidebar> & {
	className?: string,
	setCurrentPage: (page: string) => void,
}) {
	const { sitesData, selectedSite, setSelectedSite } = useSelectedSite();

	return (
		<Sidebar>
			<SidebarHeader>
				<AnimatedGradientText className="mb-4 text-2xl text-center w-5/6 max-w-full">
					<span
						className={cn(
							"inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent w-full",
						)}
					>
						Drift
					</span>
				</AnimatedGradientText>
				{selectedSite?.id && (<Select
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
				)}
			</SidebarHeader>
			<hr className="my-2" />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{menu.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton className="h-full" asChild onClick={() => setCurrentPage(item.title)}>
										<span>
											<item.icon />
											<span className="ms-4">{item.title}</span>
										</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<Button variant="outline" onClick={() => setCurrentPage("Profile")}>
					<User />
					Profile
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
