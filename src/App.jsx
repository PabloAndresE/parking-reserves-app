import { useAuth } from './hooks/useAuth';
import { UserPage } from './pages/UserPage';
import { AdminPage } from './pages/AdminPage';
import { Login } from './pages/Login';
import { Footer } from './components/Footer';
import { logout } from './services/auth';

function App() {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();

    if (loading) {
        return <div className="text-white">Cargando…</div>;
    }

    return (
        <div className="flex flex-col min-h-screen">
            {!isAuthenticated ? (
                <Login />
            ) : isAdmin ? (
                <AdminPage
                    user={user}
                    onBack={logout}
                />
            ) : (
                <UserPage
                    user={user}
                    onLogout={logout}
                />
            )}
            <Footer />
        </div>
    );
}

export default App;
