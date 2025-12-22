import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';

import { Calendar } from '../components/Calendar';
import { UsersAdminView } from '../components/admin/UsersAdminView';
import { cn } from '../services/utils';

export function AdminPage({ user, onBack }) {
    const [tab, setTab] = useState('reservations');

    return (
        <div className="flex-1 bg-neutral-900 text-white relative overflow-hidden">

            <div className="h-full overflow-y-auto pb-32">

                <div
                    className="
                        max-w-6xl w-full
                        mx-auto
                        px-3 sm:px-4
                        pt-4
                        pb-16
                        flex flex-col
                        gap-6
                    "
                >

                    {/* Header */}
                    <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold truncate">
                                Panel de Administración
                            </h1>
                            <p className="text-neutral-400 text-xs sm:text-sm">
                                Gestión de reservas y usuarios
                            </p>
                        </div>

                        <button
                            onClick={onBack}
                            className="
                                px-3 sm:px-4 py-2
                                bg-neutral-800 hover:bg-neutral-700
                                rounded-lg
                                text-xs sm:text-sm
                                flex items-center gap-2
                            "
                        >
                            <span>Volver</span>
                            <FontAwesomeIcon icon={faAngleLeft} />
                            
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
                    <div className="flex-1">

                        {/* TAB: RESERVAS */}
                        {tab === 'reservations' && (
                            <Calendar
                                user={user}
                                embedded
                            />
                        )}

                        {/* TAB: USUARIOS */}
                        {tab === 'users' && (
                            <UsersAdminView user={user} />
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
