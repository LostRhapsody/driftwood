"use client";

import React from "react";
import {
  motion,
  type AnimationProps,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "@/lib/utils";

const animationProps = {

  whileTap: {
    scale: 0.95,
  },
  whileFocus: {
    backgroundColor: "pink",
  },
  transition: {
    repeat: 1,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },

  },
} as AnimationProps;

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...animationProps}
        {...props}
        className={cn(
          "relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow dark:bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/10%)_0%,transparent_60%)] dark:hover:shadow-[0_0_20px_hsl(var(--primary)/10%)] w-full",
          className,
        )}
      >
        <span
          className="relative flex flex-row items-center size-full text-sm uppercase tracking-wide text-[rgb(0,0,0,65%)] dark:font-light dark:text-[rgb(255,255,255,90%)]"
        >
          {children}
        </span>
      </motion.button>
    );
  },
);

ShinyButton.displayName = "ShinyButton";

export default ShinyButton;
