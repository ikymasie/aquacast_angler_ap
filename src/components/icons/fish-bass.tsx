import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function FishBassIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M15.5 10H18v2h-2.5l-1 1.5-1-1.5H8.5V10H6.5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2H7" />
      <path d="M18 12v3.5a2.5 2.5 0 0 1-5 0V15" />
      <path d="M15 11l-1-2-1 2" />
      <path d="M12.5 12.5C14.16 11 15.5 11 15.5 11" />
      <path d="M7 16H6.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1.83a2 2 0 0 1 1.98.93L12.5 10" />
      <path d="M19.5 6.5a2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}
