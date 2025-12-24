import { useEffect, useState, useCallback } from 'react';
import { onAuthChange, logout as authLogout } from '../services/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const STORAGE_KEY = 'parking_user';

const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  const persistUser = (data) => {
    if (!data) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  };

  const updateUser = useCallback((newUser) => {
    setUser((prev) => {
      if (!newUser) {
        persistUser(null);
        return null;
      }

      const changed =
        !prev ||
        prev.uid !== newUser.uid ||
        prev.role !== newUser.role ||
        prev.email !== newUser.email;

      if (changed) {
        persistUser(newUser);
        return newUser;
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    let active = true;

    const handleAuthChange = async (firebaseUser) => {
      if (!active) return;

      // 🔹 Usuario NO autenticado
      if (!firebaseUser) {
        updateUser(null);
        setLoading(false);
        return;
      }

      // 🔹 Auth confirmado → setear estado base INMEDIATO
      const baseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || '',
        role: 'user' // default seguro
      };

      updateUser(baseUser);
      setLoading(false);

      // 🔹 Intentar enriquecer con Firestore (NO bloqueante)
      try {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (snap.exists()) {
          const data = snap.data();

          updateUser({
            ...baseUser,
            role: data.role || 'user'
          });
        }
      } catch (error) {
        // 🔇 Silencioso: Firestore NO rompe auth
        console.warn('User profile not ready yet');
      }
    };

    const unsubscribe = onAuthChange(handleAuthChange);

    return () => {
      active = false;
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
