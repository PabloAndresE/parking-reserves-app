import { useAuth } from './hooks/useAuth';
import { Calendar } from './components/Calendar';
import { Login } from './components/Login';
import { Footer } from './components/Footer';
import { logout } from './services/auth';
import { useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './services/firebase';


function App() {
    const { user, loading, isAuthenticated } = useAuth();



    useEffect(() => {
      if (!user) return;
    
      const syncUserProfile = async () => {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            displayName: user.displayName ?? user.email,
            email: user.email
          },
          { merge: true }
        );
      };
    
      syncUserProfile();
    }, [user]);
    

    if (loading) {
        return <div className="text-white">Cargando...</div>;
    }

    return (
        <div className="flex flex-col h-screen">
            {!isAuthenticated ? (
                <Login />
            ) : (
                <Calendar
                    user={user}
                    onLogout={async () => {
                        await logout();
                    }}
                />
            )}
            <Footer />
        </div>
    );
}

export default App;
