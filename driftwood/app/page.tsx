"use client";
import Dashboard from "./dashboard/page";
import Posts from "./posts/page";
import Profile from "./profile/page";
import Settings from "./settings/page";
import EditPost from "@/components/app_ui/edit_post";
import { DriftSidebar } from "@/components/app_ui/sidebar"
import { useSelectedPage } from "@/contexts/SelectedPageContext";

export default function page() {
  const { selectedPage } = useSelectedPage();

  return (
    <div className="flex h-screen w-full">
      <DriftSidebar />
      <main className="flex-1 overflow-auto p-4">
        <h1 className="text-xl">
          {selectedPage}
        </h1>
        <hr className="mb-2" />
        {selectedPage === "Dashboard" && <Dashboard />}
        {selectedPage === "Posts" && <Posts />}
        {selectedPage === "EditPost" && <EditPost post={undefined} />}
        {selectedPage === "Profile" && <Profile />}
        {selectedPage === "Settings" && <Settings />}
      </main>
    </div>
  );
}