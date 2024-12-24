"use client";
import {useSelectedSite} from "@/contexts/SelectedSiteContext";


export default function settings() {
  const { selectedSite } = useSelectedSite();
  return (
    <div className="items-center justify-center">
      {selectedSite?.name && selectedSite.name} - Settings
      <br />
      TODO: Add settings here
    </div>
  );
}