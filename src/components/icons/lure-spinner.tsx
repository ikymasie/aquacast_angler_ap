
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function LureSpinnerIcon(props: SVGProps<SVGSVGElement>) {
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
        <path d="M16.22 8.35l-2.45-2.45-3.1 3.1c-1.38-1.38-1.54-3.92.53-5.36 2.3-1.61 5.38.39 5.38.39" />
        <path d="M12.06 11.89L2 22s8.39-2.07 10.06-.39c1.44 1.44 3.98 1.91 5.36.53l3.1-3.1-2.45-2.45" />
        <path d="M12 12l10 10" />
    </svg>
  );
}

    