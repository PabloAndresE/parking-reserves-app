import React, { useState } from 'react';
import { cn } from '../../services/utils';
import { Calendar } from '../Calendar';
//import { UsersTable } from './UsersTable'; // puedes dejarlo inline si quieres

export function AdminPage({ user, onBack }) {
    const [tab, setTab] = useState('reservations');

    return (
        <div className="flex-1 bg-neutral-900 text-white p-4 flex flex-col gap-4 overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold">Admin Panel</h1>
                    <p className="text-neutral-400 text-xs">
                        Gestión de reservas y usuarios
                    </p>
                </div>

                <button
                    onClick={onBack}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs"
                >
                    Volver
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-neutral-800">
                {[
                    { id: 'reservations', label: 'Reservas' },
                    { id: 'users', label: 'Usuarios' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            'px-3 py-2 text-sm border-b-2 transition-colors',
                            tab === t.id
                                ? 'border-indigo-500 text-white'
                                : 'border-transparent text-neutral-400 hover:text-neutral-200'
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {tab === 'reservations' && (
                    <Calendar
                        user={user}
                        isAdmin={true}
                        onLogout={onBack}   // reutilizamos el botón
                        embedded            // flag semántico
                    />
                )}

                {tab === 'users' && (
                    <UsersAdminView />
                )}
            </div>
        </div>
    );
}
