
'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Shield } from 'lucide-react';
import { getUsersAction } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


interface RankedUser {
    id: string;
    displayName: string;
    rank: number;
}

export function RankingsList() {
    const [rankings, setRankings] = useState<RankedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        const fetchRankings = async () => {
            setIsLoading(true);
            const { data, error } = await getUsersAction();
            if (data) {
                setRankings(data);
            } else {
                console.error("Failed to load rankings:", error);
            }
            setIsLoading(false);
        };

        fetchRankings();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
            </div>
        );
    }
    
    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2);
    };

    return (
        <div className="space-y-2">
            {rankings.map((rankedUser, index) => {
                const isCurrentUser = user?.uid === rankedUser.id;
                const rank = index + 1;
                let rankIcon;
                if (rank === 1) rankIcon = <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />;
                else if (rank <= 3) rankIcon = <Crown className="w-5 h-5 text-amber-400/70 fill-amber-400/70" />;
                else if (rank <= 10) rankIcon = <Shield className="w-5 h-5 text-muted-foreground/80" />;

                return (
                    <Card key={rankedUser.id} className={cn(
                        "p-3 rounded-lg flex items-center gap-4 transition-all",
                        isCurrentUser && "bg-primary/10 border-primary/50"
                    )}>
                        <div className="flex items-center justify-center w-8 font-bold text-lg text-muted-foreground">
                            {rank}
                        </div>
                        <Avatar>
                            <AvatarFallback className={cn(isCurrentUser && 'bg-primary/20 text-primary')}>
                                {getInitials(rankedUser.displayName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className={cn("font-semibold", isCurrentUser && "text-primary-dark")}>{rankedUser.displayName}</p>
                            <p className="text-xs text-muted-foreground">Level {rankedUser.rank}</p>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center">
                            {rankIcon}
                        </div>
                    </Card>
                )
            })}
        </div>
    );
}
