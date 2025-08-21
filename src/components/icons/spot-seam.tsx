
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotSeamIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 12s4-1 10-1 10 1 10 1" />
      <path d="M2 12s4 1 10 1 10-1 10-1" />
      <path d="M12 5V2" />
      <path d="M12 22v-3" />
    </svg>
  );
}
