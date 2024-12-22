"use client";
import {useSelectedSite} from "@/contexts/SelectedSiteContext";

export default function home() {
  const { selectedSite } = useSelectedSite();
  return (
    <div className="items-center justify-center">
      {selectedSite.name} - Posts
      <br />
      TODO: Add posts here
    </div>
  );
}