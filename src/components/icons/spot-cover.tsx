
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotCoverIcon(props: SVGProps<SVGSVGElement>) {
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
        <path d="M20 18.28V15.72C20 14.12 18.66 13 17 13h-2" />
        <path d="M13 13h-2" />
        <path d="M9 13H7c-1.66 0-3 1.12-3 2.72v2.56" />
        <path d="M20 10.45V8.5a2.5 2.5 0 0 0-5 0v1.95" />
        <path d="M15 8.5c0-2.12-2.02-3-5-3S5 6.38 5 8.5" />
        <path d="M5 8.5v1.95" />
        <path d="M10 13v-2.5" />
    </svg>
  );
}
