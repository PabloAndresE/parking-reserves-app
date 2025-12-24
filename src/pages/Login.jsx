import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { login } from '../services/auth';
import logo from '../assets/logo.svg';
import { requestPushAfterLogin, preRequestPushPermission } from '../services/pushwooshService';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        preRequestPushPermission();

        try {
            // Perform login
            const user = await login(email, password);
            console.log('Login successful, user role:', user.role);
            
            // Request push notifications
            requestPushAfterLogin(user);
            
            // Store user data in localStorage to ensure it's available immediately
            localStorage.setItem('parking_user', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: user.role
            }));
            
            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err.code, err.message);
            setError('Credenciales incorrectas');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-neutral-900 pt-25 p-4 pb-24">
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-800 p-6 sm:p-8 rounded-xl w-full max-w-sm space-y-5"
            >
                {/* Logo */}
                <div className="flex justify-center">
                    <img
                        src={logo}
                        alt="OfiPark"
                        className="h-40 sm:h-42 object-contain"
                    />
                </div>

                {/* Title */}
                <h2 className="text-center text-2xl sm:text-3xl font-bold text-white">
                    Iniciar sesión
                </h2>

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded bg-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* Password */}
                <div className="relative">
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="w-full p-3 rounded bg-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="text-right mt-1">
                        <Link 
                            to="/forgot-password" 
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <p className="text-red-400 text-sm text-center">
                        {error}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 py-3 rounded font-bold text-white transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Ingresando…</span>
                        </>
                    ) : (
                        <>
                            <span>Entrar</span>
                            <FontAwesomeIcon icon={faRightToBracket} />
                            
                        </>
                    )}
                </button>

                {/* Register Link */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-neutral-500">
                        ¿No tienes una cuenta?{' '}
                        <Link 
                            to="/register" 
                            className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>

            </form>
        </div>
    );
}
