import { useState } from 'react';
import { login } from '../services/auth';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
        } catch (err) {
            console.error(err.code, err.message);
            setError('Credenciales incorrectas');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-800 p-6 sm:p-8 rounded-xl w-full max-w-sm space-y-4"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Iniciar sesión</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 rounded bg-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 rounded bg-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded font-bold text-white transition-colors"
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}
