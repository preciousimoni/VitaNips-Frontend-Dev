import { format, parseISO, isValid, formatDistanceToNowStrict } from 'date-fns';

/**
 * Formats a date string or Date object into a readable string.
 * Defaults to 'MMMM d, yyyy' (e.g., October 27, 2023).
 */
export const formatDate = (date: string | Date | null | undefined, formatStr: string = 'MMMM d, yyyy'): string => {
    if (!date) return 'N/A';
    
    let parsedDate: Date;
    if (typeof date === 'string') {
        // Handle YYYY-MM-DD manually if needed to prevent timezone shifts for pure dates
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
             // Treat YYYY-MM-DD as local date for display purposes to avoid "previous day" issues
             // or append T00:00:00 to ensure it parses
             parsedDate = parseISO(date); 
        } else {
            parsedDate = parseISO(date);
        }
        
        if (!isValid(parsedDate)) {
             parsedDate = new Date(date);
        }
    } else {
        parsedDate = date;
    }

    if (!isValid(parsedDate)) return 'Invalid Date';
    return format(parsedDate, formatStr);
};

/**
 * Formats a time string (HH:mm, HH:mm:ss) or Date object into 'h:mm a' (e.g., 10:30 AM).
 */
export const formatTime = (time: string | Date | null | undefined): string => {
    if (!time) return 'N/A';

    let parsedDate: Date;
    
    if (typeof time === 'string') {
        if (time.includes('T')) {
             // It's likely a full ISO string
             parsedDate = parseISO(time);
        } else if (time.includes(':')) {
            // Handle HH:mm or HH:mm:ss strings
            // We use a reference date (today) to parse the time component
            const now = new Date();
            const timeParts = time.split(':');
            if (timeParts.length >= 2) {
                now.setHours(parseInt(timeParts[0], 10));
                now.setMinutes(parseInt(timeParts[1], 10));
                now.setSeconds(timeParts[2] ? parseInt(timeParts[2], 10) : 0);
                parsedDate = now;
            } else {
                return time; // Return original if parsing fails logic
            }
        } else {
            return time;
        }
    } else {
        parsedDate = time;
    }

    if (!isValid(parsedDate)) return 'Invalid Time';
    return format(parsedDate, 'h:mm a');
};

/**
 * Formats a date-time string into a human-readable relative time (e.g., "2 minutes ago").
 */
export const formatRelativeTime = (dateTimeStr: string): string => {
    try {
        const date = parseISO(dateTimeStr);
        if (!isValid(date)) {
            // Fallback for non-ISO strings, try parsing as a generic date
            const fallbackDate = new Date(dateTimeStr);
            if (isValid(fallbackDate)) {
                return formatDistanceToNowStrict(fallbackDate, { addSuffix: true });
            }
            return 'Invalid Date';
        }
        return formatDistanceToNowStrict(date, { addSuffix: true });
    } catch (error) {
        console.error("Error formatting relative time:", error);
        return 'Unknown';
    }
};
