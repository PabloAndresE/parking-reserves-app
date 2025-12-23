import { useEffect, useState, useCallback } from 'react';
import { onAuthChange, logout as authLogout } from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const useAuth = () => {
    const [user, setUser] = useState(() => {
        try {
            const cached = localStorage.getItem('parking_user');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Error parsing user from localStorage:', error);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    const updateUser = useCallback((newUserData) => {
        if (!newUserData) {
            localStorage.removeItem('parking_user');
            setUser(null);
            return;
        }

        // Only update if the user data has actually changed
        setUser(prevUser => {
            const userChanged = !prevUser || 
                prevUser.uid !== newUserData.uid || 
                prevUser.role !== newUserData.role;
                
            if (userChanged) {
                localStorage.setItem('parking_user', JSON.stringify(newUserData));
                return newUserData;
            }
            return prevUser;
        });
    }, []);

    useEffect(() => {
        let isMounted = true;

        const handleAuthChange = async (firebaseUser) => {
            if (!isMounted) return;

            if (!firebaseUser) {
                updateUser(null);
                setLoading(false);
                return;
            }

            try {
                // Get user data from Firestore first
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};
                
                const updatedUser = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName || '',
                    role: userData.role || 'user'
                };

                updateUser(updatedUser);
            } catch (error) {
                console.error('Error handling auth change:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        const unsubscribe = onAuthChange(handleAuthChange);

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [updateUser]);

    const logout = useCallback(async () => {
        try {
            await authLogout();
            updateUser(null);
            return true;
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            return false;
        }
    }, [updateUser]);

    return {
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        logout
    };
};

export { useAuth };
