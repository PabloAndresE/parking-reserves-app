import React from 'react';
import { User, Check } from 'lucide-react';

export function UserSelector({ users, onSelect }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                        Bienvenido
                    </h1>
                    <p className="text-neutral-400">¿Quién va a parquear hoy?</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-8">
                    {users.map((user) => (
                        <button
                            key={user}
                            onClick={() => onSelect(user)}
                            className="group relative flex items-center p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-indigo-500 rounded-xl transition-all duration-300 ease-out"
                        >
                            <div className="flex-shrink-0 mr-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                    <User className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300" />
                                </div>
                            </div>

                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-medium text-white group-hover:text-indigo-100">
                                    {user}
                                </h3>
                            </div>

                            <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0">
                                <Check className="h-5 w-5 text-indigo-400" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
