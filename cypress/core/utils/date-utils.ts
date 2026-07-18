import dayjs from 'dayjs'

export class DateUtils {
    /** Date string N days from today in the given format (default MM/DD/YYYY). */
    static dateFromToday(daysAfter: number = 0, format: string = 'MM/DD/YYYY'): string {
        return dayjs().add(daysAfter, 'day').format(format)
    }

    /** ISO date string N days from today. */
    static dateFromTodayAsIso(daysAfter: number = 0): string {
        return dayjs().add(daysAfter, 'day').startOf('day').toISOString()
    }
}
