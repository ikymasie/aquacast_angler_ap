
import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function SpotPointIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M22 13.01V20H2v-6.99" />
      <path d="M22 13.01c-4.42-5.52-15.58-5.52-20 0" />
    </svg>
  );
}
