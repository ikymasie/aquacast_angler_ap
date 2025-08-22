
'use client';
import { ProgressTab } from '@/components/tabs/progress-tab';

// This is a wrapper component to allow the ProgressTab to be used inside other server components
// while it itself is a client component.
export function PracticeTab() {
    return <ProgressTab isInsideSpotDetails />;
}
