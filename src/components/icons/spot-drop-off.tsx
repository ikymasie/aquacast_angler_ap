
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotDropOffIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M2 8.24v5.52" />
      <path d="M6 5.86v12.28" />
      <path d="M10 4.43v15.14" />
      <path d="M14 4.02v15.96" />
      <path d="M18 5.49v13.02" />
      <path d="M22 8.71v4.58" />
      <path d="M2 10.45c2-1 4-1.5 6-1.5s4 .5 6 1.5 4 1.5 6 1.5" />
    </svg>
  );
}
