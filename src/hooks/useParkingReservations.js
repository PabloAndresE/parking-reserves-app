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

    const resolveUser = useCallback(async (uid) => {
        setUsersById(prev => {
            if (prev[uid]) return prev;
            return { ...prev, [uid]: null };
        });
    
        const snap = await getDoc(doc(db, 'users', uid));
        const name = snap.exists() ? snap.data().displayName : uid;
    
        setUsersById(prev => ({ ...prev, [uid]: name }));
    }, []);
    

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

     /* =====================
       Admin actions
    ===================== */

    const reserveAsAdmin = async (date, uid) => {
        const result = await saveReservation(date, uid);
        await loadDay(date);
        return result;
    };

    const cancelAsAdmin = async (date, uid) => {
        await removeReservation(date, uid);
        await loadDay(date);
    };

    /* =====================
       Admin helpers
    ===================== */

    const getAllUsers = useCallback(() => {
        return Object.entries(usersById).map(([uid, name]) => ({
            uid,
            displayName: name
        }));
    }, [usersById]);
    return {
        getStatus,
        reserve,
        cancel,
        reserveAsAdmin,
        cancelAsAdmin,
        loadDay,
        getUserReservations,
        getUserName,
        getAllUsers
    };
}
