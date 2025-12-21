import { useCallback, useEffect, useRef, useState } from 'react';
import {
    saveReservation,
    removeReservation
} from '../services/storage';

import {
    doc,
    onSnapshot,
    getDoc
} from 'firebase/firestore';

import { db } from '../services/firebase';

export function useParkingReservations(currentUser) {
    const [cache, setCache] = useState({});
    const [usersById, setUsersById] = useState({});

    // listeners activos por día
    const listenersRef = useRef({});

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
       REALTIME: subscribe day
    ===================== */

    const loadDay = useCallback(
        (date) => {
            // evitar listeners duplicados
            if (listenersRef.current[date]) return;

            const ref = doc(db, 'parkingReservations', date);

            const unsubscribe = onSnapshot(ref, snap => {
                if (!snap.exists()) {
                    setCache(prev => ({
                        ...prev,
                        [date]: { users: [], count: 0, isFull: false }
                    }));
                    return;
                }

                const users = snap.data().users ?? [];

                setCache(prev => ({
                    ...prev,
                    [date]: {
                        users,
                        count: users.length,
                        isFull: false // si tienes cupo fijo, se puede calcular aquí
                    }
                }));

                users.forEach(resolveUser);
            });

            listenersRef.current[date] = unsubscribe;
        },
        [resolveUser]
    );

    /* =====================
       Cleanup listeners
    ===================== */

    useEffect(() => {
        return () => {
            Object.values(listenersRef.current).forEach(unsub => unsub());
            listenersRef.current = {};
        };
    }, []);

    /* =====================
       Get cached status
    ===================== */

    const getStatus = useCallback(
        (date) =>
            cache[date] ?? { users: [], count: 0, isFull: false },
        [cache]
    );

    /* =====================
       Actions (NO loadDay aquí)
    ===================== */

    const reserve = async (date) => {
        return saveReservation(date, currentUser);
    };

    const cancel = async (date) => {
        return removeReservation(date, currentUser);
    };

    const reserveAsAdmin = async (date, uid) => {
        return saveReservation(date, uid);
    };

    const cancelAsAdmin = async (date, uid) => {
        return removeReservation(date, uid);
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
