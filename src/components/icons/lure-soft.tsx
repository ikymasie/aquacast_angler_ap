
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function LureSoftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={cn(props.className)}
        {...props}
    >
      <path d="M15 5c-2.7-2.7-9-2-9 4 0 4.5 4.5 9 4.5 9s5.5-4.5 5.5-9c0-2-1.3-3.3-3-4" />
      <path d="M10 9a2 2 0 1 0-4 0 2 2 0 0 0 4 0" />
      <path d="M13.5 12.5c2.3-2.3 7-2 7 2.5 0 3.6-3.6 7-3.6 7s-4.4-3.4-4.4-7c0-1.5 1-2.5 2.5-2.5" />
      <path d="M17 16a1 1 0 1 0-2 0 1 1 0 0 0 2 0" />
    </svg>
  );
}
