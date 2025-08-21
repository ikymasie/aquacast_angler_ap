import { cn } from "@/lib/utils";
import Image from "next/image";

interface AquaCastLogoProps {
  className?: string;
}

export function AquaCastLogo({ className }: AquaCastLogoProps) {
  return (
    <div className={cn("relative", className)}>
      <Image 
        src="/images/logo.png" 
        alt="AquaCast Logo" 
        width={24} 
        height={24}
        className="object-contain"
      />
    </div>
  );
}
