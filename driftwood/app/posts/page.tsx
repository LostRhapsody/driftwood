"use client";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "@/components/ui/animated-gradient-text";

export default function home() {
    return (
    <div className="items-center justify-center">
      SiteName's Posts
      <AnimatedGradientText>
        🎉 <hr className="w-px h-4 mx-2 bg-gray-300 shrink-0" />{" "}
        <span
          className={cn(
            "inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent",
          )}
        >
          This is the Posts page
        </span>
        <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
      </AnimatedGradientText>
    </div>
  );
}