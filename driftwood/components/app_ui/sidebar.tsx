"use client";

import * as React from "react";
import { PanelTop, StickyNote, Settings, User, LogOut } from "lucide-react";
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

// This is a placeholder for your sites data
const sitesData = [
	{ id: "1", name: "Site 1" },
	{ id: "2", name: "Site 2" },
	{ id: "3", name: "Site 3" },
];

const menu = [
	{
		title: "Posts",
		url: "#",
		icon: StickyNote,
	},
	{
		title: "Site",
		url: "#",
		icon: PanelTop,
	},
	{
		title: "User",
		url: "#",
		icon: User,
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
        <h1>Drift</h1>
        <Select>
          <SelectTrigger className="w-[180px]">
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
			<SidebarContent className="h-full">
				<SidebarGroup className="h-full">
					<SidebarGroupContent className="h-full">
						<SidebarMenu className="h-full flex justify-evenly">
							{menu.map((item) => (
								<SidebarMenuItem
								key={item.title}>
									<SidebarMenuButton asChild>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<Button><LogOut/>Logout</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
