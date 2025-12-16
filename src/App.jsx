import { useAuth } from './hooks/useAuth';
import { Calendar } from './components/Calendar';
import { AdminPage } from './components/admin/AdminPage';
import { Login } from './components/Login';
import { Footer } from './components/Footer';
import { logout } from './services/auth';

function App() {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();

    if (loading) {
        return <div className="text-white">Cargando…</div>;
    }

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            {isAdmin ? (
                <AdminPage
                    user={user}
                    onBack={logout}
                />
            ) : (
                <Calendar
                    user={user}
                    onLogout={logout}
                />
            )}
            <Footer />
        </div>
    );
}

export default App;
