import { useCallback, useEffect, useState } from 'react';
import {
    getDayStatus,
    saveReservation,
    removeReservation
} from '../services/storage';

export function useParkingReservations(currentUser) {
    const [cache, setCache] = useState({});

    const loadDay = useCallback(async (date) => {
        const status = await getDayStatus(date);
        setCache(prev => ({ ...prev, [date]: status }));
        return status;
    }, []);

    const getStatus = useCallback(
        (date) =>
            cache[date] ?? { users: [], count: 0, isFull: false },
        [cache]
    );

    const reserve = async (date) => {
        const result = await saveReservation(date, currentUser);
        await loadDay(date);
        return result;
    };

    const cancel = async (date) => {
        await removeReservation(date, currentUser);
        await loadDay(date);
    };

    const getUserReservations = useCallback(() => {
        return Object.entries(cache)
            .filter(([_, s]) => s.users.includes(currentUser))
            .map(([date]) => date)
            .sort();
    }, [cache, currentUser]);

    return {
        getStatus,
        reserve,
        cancel,
        loadDay,
        getUserReservations
    };
}
