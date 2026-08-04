export function log(unit: string, message: string, showSnackbar: (message: string) => void): void {
    console.log(unit + ": " + message);
    showSnackbar(message);
}

function getJerusalemDateString(date: Date): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jerusalem",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

export function hasDayPassedSince(checkedAt: number | null): boolean {
    if (checkedAt == null) return false;
    return getJerusalemDateString(new Date(checkedAt)) !== getJerusalemDateString(new Date());
}