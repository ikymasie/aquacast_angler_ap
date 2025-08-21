
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotBankIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 13.01V20h20v-6.99" />
      <path d="M2 13.01C2 8.5 6.5 5.5 12 5.5S22 8.5 22 13.01" />
    </svg>
  );
}
