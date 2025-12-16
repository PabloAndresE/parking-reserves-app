import { useState } from 'react';
import { login } from '../services/auth';
import logo from '../assets/logo.svg';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
        } catch (err) {
            console.error(err.code, err.message);
            setError('Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-neutral-900 pt-25 p-4">
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
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full p-3 rounded bg-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

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
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 py-3 rounded font-bold text-white transition-colors"
                >
                    {loading ? 'Ingresando…' : 'Entrar'}
                </button>
            </form>
        </div>
    );
}
