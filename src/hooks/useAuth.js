import { useEffect, useState } from 'react';
import { onAuthChange } from '../services/auth';

export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const unsubscribe = onAuthChange(firebaseUser => {
            if (!mounted) return;

            setUser(firebaseUser);
            setLoading(false);
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user
    };
}
