
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function DayEveningIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
      <path d="M12 4v1m5.66 1.34.7.7M20 12h-1m-1.34 5.66-.7.7M12 20v-1m-5.66-1.34-.7-.7M4 12h1m1.34-5.66.7-.7" />
    </svg>
  );
}
