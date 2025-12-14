import { useCallback, useEffect, useState } from 'react';
import {
    getDayStatus,
    saveReservation,
    removeReservation
} from '../services/storage';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useParkingReservations(currentUser) {
    const [cache, setCache] = useState({});
    const [usersById, setUsersById] = useState({});

    /* =====================
       Resolve user name
    ===================== */

    const resolveUser = useCallback(
        async (uid) => {
            if (usersById[uid]) return usersById[uid];

            const snap = await getDoc(doc(db, 'users', uid));
            const name = snap.exists()
                ? snap.data().displayName
                : uid;

            setUsersById(prev => ({ ...prev, [uid]: name }));
            return name;
        },
        [usersById]
    );

    /* =====================
       Load day from storage
    ===================== */

    const loadDay = useCallback(
        async (date) => {
            const status = await getDayStatus(date);

            setCache(prev => ({ ...prev, [date]: status }));

            // precargar nombres de usuarios
            status.users.forEach(uid => {
                resolveUser(uid);
            });

            return status;
        },
        [resolveUser]
    );

    /* =====================
       Get cached status
    ===================== */

    const getStatus = useCallback(
        (date) =>
            cache[date] ?? { users: [], count: 0, isFull: false },
        [cache]
    );

    /* =====================
       Actions
    ===================== */

    const reserve = async (date) => {
        const result = await saveReservation(date, currentUser);
        await loadDay(date);
        return result;
    };

    const cancel = async (date) => {
        await removeReservation(date, currentUser);
        await loadDay(date);
    };

    /* =====================
       User reservations
    ===================== */

    const getUserReservations = useCallback(() => {
        return Object.entries(cache)
            .filter(([_, s]) => s.users.includes(currentUser))
            .map(([date]) => date)
            .sort();
    }, [cache, currentUser]);

    /* =====================
       Expose user name
    ===================== */

    const getUserName = useCallback(
        (uid) => usersById[uid] ?? uid,
        [usersById]
    );

    return {
        getStatus,
        reserve,
        cancel,
        loadDay,
        getUserReservations,
        getUserName
    };
}
