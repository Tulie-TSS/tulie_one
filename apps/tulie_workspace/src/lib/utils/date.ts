import { format, formatDistanceToNow, differenceInDays, addWeeks, addDays } from 'date-fns'
import { vi } from 'date-fns/locale'

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
    return format(new Date(date), pattern, { locale: vi })
}

export function formatDateTime(date: string | Date): string {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi })
}

export function formatRelative(date: string | Date): string {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

export function daysBetween(from: string | Date, to: string | Date): number {
    return differenceInDays(new Date(to), new Date(from))
}

export function getCycleEndDate(startDate: string | Date): Date {
    return addWeeks(new Date(startDate), 12)
}

export function getBufferWeekStart(endDate: string | Date): Date {
    return addDays(new Date(endDate), 1)
}

export function getCycleWeek(startDate: string | Date): number {
    const weeks = Math.ceil(daysBetween(startDate, new Date()) / 7)
    return Math.min(Math.max(weeks, 1), 13)
}

export function formatDuration(hours: number): string {
    if (hours < 1) return `${Math.round(hours * 60)}m`
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}
