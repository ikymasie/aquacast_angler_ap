
'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PersonBadgeProps {
    name: string;
    blurb: string;
}

export function PersonBadge({ name, blurb }: PersonBadgeProps) {
    const initials = name.split(' ').map(n => n[0]).join('');
    return (
        <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
                <AvatarImage src={`https://placehold.co/56x56.png`} alt={`Portrait of ${name}`} data-ai-hint="person portrait" />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{blurb}</p>
            </div>
        </div>
    );
}
