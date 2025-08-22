
'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PersonBadge } from "./person-badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp, Wrench, Coffee } from "lucide-react";

export function AboutCard({ about }: { about: { author: string; company: string; mission: string } }) {
    return (
        <Card className="p-4 rounded-xl shadow-card">
            <h2 className="font-headline text-lg font-semibold mb-2">About the Project</h2>
            <div className="space-y-3">
                 <p className="text-base text-muted-foreground">
                    Built in Botswana by <span className="font-semibold text-foreground">{about.author}</span> at <span className="font-semibold text-foreground">{about.company}</span>, this app helps anglers plan smarter sessions with species-aware forecasts and practice drills for bream, bass & carp. It’s free, open-source, and sustained by community donations to keep the code, servers, and coffee flowing.
                </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">Open Source</Badge>
                <Badge variant="secondary">Community-funded</Badge>
                <Badge variant="secondary">Botswana 🇧🇼</Badge>
            </div>
        </Card>
    )
}


export function SpecialThanksCard({ people }: { people: { name: string, blurb: string }[] }) {
    return (
        <Card className="p-4 rounded-xl shadow-card">
            <h2 className="font-headline text-lg font-semibold mb-3">Special Thanks</h2>
            <div className="space-y-4">
                {people.map(person => (
                    <PersonBadge key={person.name} name={person.name} blurb={person.blurb} />
                ))}
            </div>
        </Card>
    );
}

const transparencyItems = [
    { label: "Servers & APIs", value: 50, icon: TrendingUp },
    { label: "Engineering & Maintenance", value: 40, icon: Wrench },
    { label: "Community & Coffee", value: 10, icon: Coffee },
];

export function TransparencyCard() {
    return (
        <Card className="p-4 rounded-xl shadow-card">
            <h2 className="font-headline text-lg font-semibold mb-3">Where Your Donation Goes</h2>
            <div className="flex flex-col sm:flex-row gap-2">
                {transparencyItems.map(item => (
                    <div key={item.label} className="flex-1 bg-secondary/60 p-3 rounded-lg flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-primary" />
                        <div>
                            <p className="font-bold text-xl">{item.value}%</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}


export function CommunityCard() {
  return (
    <Card className="p-4 rounded-xl shadow-card">
      <h2 className="font-headline text-lg font-semibold mb-3">Join The Community</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button variant="secondary">Share Feedback</Button>
        <Button variant="secondary">Suggest a Feature</Button>
        <Button variant="secondary">Invite a Friend</Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-3">We build in the open—your ideas shape the roadmap.</p>
    </Card>
  );
}
