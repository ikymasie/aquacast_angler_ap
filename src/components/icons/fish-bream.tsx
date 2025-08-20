
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function FishBreamIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M15 15.5C15 15.5 16.5 14.5 18 14" />
      <path d="M16 18a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1" />
      <path d="M15 12H9.5a2.5 2.5 0 0 0-2.29 1.44" />
      <path d="M8.5 15.5C7 15.5 5 16 5 16" />
      <path d="M12 12v-2a2 2 0 0 0-2-2H8" />
      <path d="M10 10V6.5a2.5 2.5 0 0 1 5 0V10" />
      <path d="M19 12a7 7 0 0 0-14 0" />
      <path d="M19 12a7 7 0 0 1-14 0" />
    </svg>
  );
}
