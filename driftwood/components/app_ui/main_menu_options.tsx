/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Globe, AlignLeft } from "lucide-react";

export default function MainMenuOptions() {

  return (
    <div id="logged_in_view" className="flex flex-row gap-8">
      <a href="/new_site">
      <Button id="create_site" className="w-40 h-40 flex flex-col gap-4">
        <Globe size={64} />
        <p>Create new site</p>
      </Button>
      </a>
      <a href="/sites">
      <Button id="create_site" className="w-40 h-40 flex flex-col gap-4">
        <AlignLeft size={64} />
        <p>List your sites</p>
      </Button>
      </a>
    </div>
  );
};