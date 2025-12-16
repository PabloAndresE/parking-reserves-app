import { useEffect, useState } from 'react';
import { onAuthChange } from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // 🔹 Load Firestore profile
            const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
            const profile = snap.exists() ? snap.data() : {};

            setUser({
                ...firebaseUser,
                role: profile.role ?? 'user'
            });

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };
}
