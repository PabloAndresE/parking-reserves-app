import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { UserPage } from './pages/UserPage';
import { AdminPage } from './pages/AdminPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Footer } from './components/Footer';

// Componente para manejar la autenticación y redirecciones
function AuthHandler() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const isLoginPage = location.pathname === '/login';
    const isRegisterPage = location.pathname === '/register';
    const isForgotPasswordPage = location.pathname === '/forgot-password';
    const isAdminPage = location.pathname.startsWith('/admin');

    // Si es una página pública, no hacer redirecciones
    if (isForgotPasswordPage || isRegisterPage) return;

    if (!isAuthenticated) {
      if (!isLoginPage) {
        navigate('/login', { replace: true });
      }
    } else if (isLoginPage) {
      // Si está en login y autenticado, redirigir según el rol
      navigate(isAdmin ? '/admin' : '/', { replace: true });
    } else if (isAdminPage && !isAdmin) {
      // Si intenta acceder a /admin sin ser admin
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, location.pathname, navigate]);

  return null;
}

// Componente de ruta protegida
function ProtectedRoute({ children, requiredAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <div className="text-white">Cargando…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredAdmin={true}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
