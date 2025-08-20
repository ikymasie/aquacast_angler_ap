import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function FishCarpIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(props.className)}
      {...props}
    >
      <path d="M12.2 11.2a2 2 0 0 0-2.4 0" />
      <path d="M16 17.3a2.5 2.5 0 0 1-4.8 1.2" />
      <path d="M18 12.8A7.3 7.3 0 0 0 5 12.8" />
      <path d="M21 12.8A10.3 10.3 0 0 0 3 12.8" />
      <path d="M18 12.8a2.5 2.5 0 0 1-2 2.5h-1.3a2.5 2.5 0 0 1-2.5-2.5" />
      <path d="M16.5 6.8a2.5 2.5 0 0 1 0 5" />
      <path d="M9.3 15.3a2.5 2.5 0 0 1-1.8-4.1" />
      <path d="M11.3 6.3A2.5 2.5 0 0 1 13 4a2.5 2.5 0 0 1 2.5 2.5" />
    </svg>
  );
}
