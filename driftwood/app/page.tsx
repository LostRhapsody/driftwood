"use client";
import {useSelectedSite} from "@/contexts/SelectedSiteContext";

export default function home() {
  const { selectedSite } = useSelectedSite();

    return (
    <div className="items-center justify-center">
      <h1>Dashboard for {selectedSite.name}</h1>
      {/* TODO - Implement the following functions */}
      <div>Total post count: </div>
      <div>Latest deploy status: </div>
      <div>Site URL with preview button</div>
      <div>Build Status of site</div>
      <div>New Post button</div>
      <div>Deploy site button</div>
      <div>Grid of the most recent posts</div>
      <div>Quick Edit/Delete actions</div>
      <div>Site overview card</div>
      <div>Recent Activity Feed</div>
      <div>Technical details</div>
    </div>
  );
}