import { useAuth } from './hooks/useAuth';
import { Calendar } from './components/Calendar';
import { Login } from './components/Login';
import { Footer } from './components/Footer';
import { logout } from './services/auth';


import { updateProfile } from 'firebase/auth';
import { useEffect } from 'react';

function App() {
    const { user, loading, isAuthenticated } = useAuth();

    useEffect(() => {
      if (!user) return;

      if (!user.displayName) {
          updateProfile(user, {
              displayName: 'Pablo'
          });
      }
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
                    user={user.email}
                    onLogout={logout}
                />
            )}
            <Footer />
        </div>
    );
}

export default App;
