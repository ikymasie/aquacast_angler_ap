
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotFlatIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M5 12h14" />
      <path d="M5 12c0-4 14-4 14 0" />
      <path d="M5 12c0 4 14 4 14 0" />
    </svg>
  );
}
