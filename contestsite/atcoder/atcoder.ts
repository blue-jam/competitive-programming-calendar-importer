export function parseDateString(dateString: string) {
    const formattedString = dateString.trim()
        .replace(/\(.*\)/g, "")
        .replace(" ", "T");

    return new Date(
        `${formattedString}+09:00`
    );
}

export function calculateDurationFromString(duration: string): number {
    const [durationHour, durationMinute] = duration.split(":")
        .map((s) => parseInt(s, 10));

    return durationHour * 3600 + durationMinute * 60;
}

export function calculateEndDate(date: Date, duration: number) {
    return new Date(date.getTime() + duration * 1000);
}
