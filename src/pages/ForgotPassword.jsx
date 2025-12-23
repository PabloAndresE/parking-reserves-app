import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEnvelope, faSpinner } from '@fortawesome/free-solid-svg-icons';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            setMessage('Se ha enviado un correo con instrucciones para restablecer tu contraseña.');
            setEmail('');
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            setError('No se pudo enviar el correo. Verifica el correo e inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
            <div className="bg-neutral-800 p-8 rounded-xl w-full max-w-md">
                <div className="mb-6">
                    <Link 
                        to="/login" 
                        className="text-indigo-400 hover:text-indigo-300 flex items-center mb-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Volver al inicio de sesión
                    </Link>
                    <h2 className="text-2xl font-bold text-white mb-2">Restablecer contraseña</h2>
                    <p className="text-neutral-400">
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded">
                        {error}
                    </div>
                )}

                {message ? (
                    <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-200 rounded">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-neutral-500" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="tucorreo@ejemplo.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Enviando...
                                </>
                            ) : 'Enviar enlace'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
