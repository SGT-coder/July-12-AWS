
"use client";

import { format, formatDistanceToNow } from 'date-fns';
// The 'am' locale is causing a build error, so it's temporarily removed.
// import { am } from 'date-fns/locale/am';

interface DateDisplayProps {
    dateString: string;
    includeTime?: boolean;
}

export function DateDisplay({ dateString, includeTime = false }: DateDisplayProps) {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        const fullFormat = includeTime ? 'MMM d, yyyy, h:mm a' : 'MMM d, yyyy';
        const fullDate = format(date, fullFormat);
        const relativeDate = formatDistanceToNow(date, { addSuffix: true });

        return (
            <span title={fullDate}>
                {relativeDate}
            </span>
        );
    } catch (error) {
        console.error("Invalid date string:", dateString);
        return <span>Invalid Date</span>;
    }
}
