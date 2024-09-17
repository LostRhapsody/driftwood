"use client";
import { Button } from "@/components/ui/button";
import { CircleArrowLeft } from "lucide-react";
export default function sites() {
  return (
    <div className="grid grid-rows items-center justify-items-center min-h-screen gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <a href="/">
          <Button variant="outline" className="flex flex-row gap-2">
            <CircleArrowLeft />
            Go back home
          </Button>
        </a>
        <h1 className="text-7xl">Your sites</h1>
      </main>
    </div>
  );
}
