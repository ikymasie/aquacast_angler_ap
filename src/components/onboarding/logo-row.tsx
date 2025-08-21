
import { AquaCastLogo } from "@/components/aqua-cast-logo";

export function LogoRow() {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <AquaCastLogo className="w-14 h-14" />
            <h1 className="font-headline text-[28px] leading-[34px] font-bold text-ink-900">
                AquaCast
            </h1>
        </div>
    );
}
