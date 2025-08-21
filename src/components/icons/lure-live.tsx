
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function LureLiveIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M13.48 3.52a2 2 0 0 0-2.96 0l-4 4A2 2 0 0 0 6 9.96V14a2 2 0 0 0 2 2h4.04a2 2 0 0 0 1.41-.59l4-4a2 2 0 0 0 0-2.96l-1.47-1.47" />
      <path d="M12 12V2.5" />
      <path d="M15 15 c-2 2-5 2-7 0" />
      <path d="m22 2-6 6" />
    </svg>
  );
}

    