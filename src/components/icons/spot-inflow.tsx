
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotInflowIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 18v-6" />
      <path d="M12 6V5" />
      <path d="M16 8.5c0-2.33-2-3.5-4-3.5s-4 1.17-4 3.5" />
      <path d="M18 13.91c-1.41.81-3.13 1.3-5 1.45V18" />
      <path d="m6 13.91 1.3.75" />
      <path d="M11 18h2" />
      <path d="M5.45 10.36C3.27 11.23 2 12.5 2 14c0 2.5 4.5 4 10 4s10-1.5 10-4c0-1.5-1.27-2.77-3.45-3.64" />
    </svg>
  );
}
