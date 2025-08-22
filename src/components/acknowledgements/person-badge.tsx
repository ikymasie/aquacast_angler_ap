
'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PersonBadgeProps {
    name: string;
    blurb: string;
}

export function PersonBadge({ name, blurb }: PersonBadgeProps) {
    const initials = name.split(' ').map(n => n[0]).join('');
    return (
        <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={`https://placehold.co/48x48.png`} alt={`Portrait of ${name}`} data-ai-hint="person portrait" />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{blurb}</p>
            </div>
        </div>
    );
}
