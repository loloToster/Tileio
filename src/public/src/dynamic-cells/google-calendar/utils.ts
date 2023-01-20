export const DAY_NAMES = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
]

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

export function addDays(date: Date, days: number) {
    var result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

/**
 * Parses Date to HH:MM - ex. 'Thu, 01 Jan 1970 02:19:34 GMT' -> '02:19'
 */
export function getHHMMfromDate(d: Date) {
    return d.toTimeString().split(" ")[0].slice(0, -3)
}

/**
 * Checks whether two dates are in the same day (ignores hours, minutes, seconds...)
 */
export function sameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

/**
 * Checks whether d1 is in an earlier day then d2
 */
export function earilerDay(d1: Date, d2: Date) {
    return d1.getFullYear() <= d2.getFullYear() &&
        d1.getMonth() <= d2.getMonth() &&
        d1.getDate() < d2.getDate();
}

/**
 * Checks whether d1 is in a later day then d2
 */
export function laterDay(d1: Date, d2: Date) {
    return d1.getFullYear() >= d2.getFullYear() &&
        d1.getMonth() >= d2.getMonth() &&
        d1.getDate() > d2.getDate();
}
