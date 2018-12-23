export function calculateDurationFromString (duration: string) : number {
    const [durationHour, durationMinute] = duration.split(":")
        .map((s) => parseInt(s, 10));

    return durationHour * 3600 + durationMinute * 60;
}
