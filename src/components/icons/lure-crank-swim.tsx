
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function LureCrankSwimIcon(props: SVGProps<SVGSVGElement>) {
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
        <path d="M10 12l-2.5 2.5a6.07 6.07 0 0 0 0 8.5L10 20.5l8-8-7.5-7.5-1.5 1.5"/>
        <path d="M14 8l-1-1 4-4 4 4-1 1"/>
        <path d="M12 15l-1.5 1.5"/>
    </svg>
  );
}
