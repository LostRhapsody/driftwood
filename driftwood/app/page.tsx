"use client";
import {useSelectedSite} from "@/contexts/SelectedSiteContext";

export default function home() {
  const { selectedSite } = useSelectedSite();

    return (
    <div className="items-center justify-center">
      Dashboard for {selectedSite.name}
    </div>
  );
}