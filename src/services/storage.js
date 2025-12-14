import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'parkingReservations';
const MAX_SPOTS_PER_DAY = 2;

export async function getDayStatus(date) {
    const ref = doc(db, COLLECTION, date);
    const snap = await getDoc(ref);

    const users = snap.exists() ? snap.data().users ?? [] : [];

    return {
        count: users.length,
        users,
        isFull: users.length >= MAX_SPOTS_PER_DAY
    };
}

export async function saveReservation(date, user) {
    const ref = doc(db, COLLECTION, date);
    const snap = await getDoc(ref);

    const users = snap.exists() ? snap.data().users ?? [] : [];

    if (users.includes(user)) {
        return { ok: true, reason: 'ALREADY_RESERVED' };
    }

    if (users.length >= MAX_SPOTS_PER_DAY) {
        return { ok: false, reason: 'DAY_FULL' };
    }

    await setDoc(ref, { users: [...users, user] });

    return { ok: true };
}

export async function removeReservation(date, user) {
    const ref = doc(db, COLLECTION, date);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const users = snap.data().users.filter(u => u !== user);

    if (users.length === 0) {
        await deleteDoc(ref);
    } else {
        await updateDoc(ref, { users });
    }
}
