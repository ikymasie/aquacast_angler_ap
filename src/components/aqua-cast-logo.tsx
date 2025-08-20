import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function AquaCastLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", props.className)}
      {...props}
    >
      <path d="M17.5 17.5c-3.33-3.33-3.33-5 0-8.33" />
      <path d="M6.5 6.5c3.33 3.33 3.33 5 0 8.33" />
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
      <path d="M12 12l-2 4h4l-2-4z" />
    </svg>
  );
}
