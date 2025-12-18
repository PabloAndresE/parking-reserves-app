import { startOfToday, isWeekend } from 'date-fns';

export function canReserveDay({ day, status, user }) {
    const isPast = day < startOfToday();
    const isWeekendDay = isWeekend(day);
    const isFull = status.isFull;

    const canForce = user.role === 'admin' || user.role === 'supervisor';

    if (isPast && !canForce) {
        return { allowed: false, reason: 'PAST_DAY' };
    }

    if (isWeekendDay && !canForce) {
        return { allowed: false, reason: 'WEEKEND' };
    }

    if (isFull && !canForce) {
        return { allowed: false, reason: 'DAY_FULL' };
    }

    return { allowed: true };
}
