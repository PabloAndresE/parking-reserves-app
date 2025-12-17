import { useEffect, useState } from 'react';
import { onAuthChange } from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useAuth() {
    const [user, setUser] = useState(() => {
        const cached = localStorage.getItem('parking_user');
        return cached ? JSON.parse(cached) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // � COLD START OPTIMIZATION:
            // Don't wait for Firestore (getDoc) to finish. Render immediately as 'user'.
            // If the user is actually 'admin', the UI will update a moment later.

            // Initial user state from firebaseUser, without role yet
            setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                role: 'user' // Default role until Firestore loads
            });
            setLoading(false); // Stop spinner immediately

            // 🔹 Load Firestore profile (Background Update)
            getDoc(doc(db, 'users', firebaseUser.uid)).then(snap => {
                const profile = snap.exists() ? snap.data() : {};
                const role = profile.role ?? 'user';

                localStorage.setItem(`role_${firebaseUser.uid}`, role);

                const finalUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    role: role
                };

                // Persist full session to enable Instant Load next time
                localStorage.setItem('parking_user', JSON.stringify(finalUser));

                // Update state if needed
                setUser(prev => {
                    // If we already have the correct role (from cache), don't update to save re-render
                    if (prev?.role === role) return prev;
                    return finalUser;
                });
            });
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
