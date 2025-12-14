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
            setError(err.code);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900">
            <form
                onSubmit={handleSubmit}
                className="bg-neutral-800 p-6 rounded-xl w-80 space-y-4"
            >
                <h2 className="text-xl font-bold text-white">Iniciar sesión</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 rounded bg-neutral-700 text-white"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 rounded bg-neutral-700 text-white"
                />

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-bold text-white"
                >
                    Entrar
                </button>
            </form>
        </div>
    );
}
