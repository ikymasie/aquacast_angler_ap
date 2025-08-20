
interface SectionHeaderProps {
    title: string;
    className?: string;
}

export function SectionHeader({ title, className }: SectionHeaderProps) {
    return (
        <h2 className={`font-headline text-h3 font-semibold text-ink-900 ${className}`}>
            {title}
        </h2>
    )
}
