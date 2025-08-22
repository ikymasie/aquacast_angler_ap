
'use client';

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PersonBadgeProps {
    name: string;
   
    blurb: string;
}

export function PersonBadge({ name, blurb }: PersonBadgeProps) {
    const initials = name.split(' ').map(n => n[0]).join('');
    let url = '../../../public/images/thanks/';
    if(name.toLowerCase().includes('bob')){
        url +='bob.png'
    } else  if(name.toLowerCase().includes('segopa')){
        url +='ak.png'
    } else{
        url += 'group.png'
    }
    return (
        <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={url} alt={`Portrait of ${name}`} data-ai-hint="person portrait" />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{blurb}</p>
            </div>
        </div>
    );
}
