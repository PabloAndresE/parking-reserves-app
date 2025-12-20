import React, { useState } from 'react';
import { Calendar } from '../components/Calendar';
import { UserSummaryView } from '../components/user/UserSummaryView';
import { cn } from '../services/utils';
import { Modal } from '../components/Modal';
import { saveReservation } from '../services/storage'; // ✅ [NEW]

export function UserPage({ user, onLogout }) {
    const [tab, setTab] = useState('calendar');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [sessionReservations, setSessionReservations] = useState([]);
    const [confirmToken, setConfirmToken] = useState(0);

    // ✅ [NEW] Implementación real
    const confirmarReservaEnFirestore = async () => {
        // Si no hay nada, no hacemos nada
        if (!sessionReservations || sessionReservations.length === 0) return;

        // Guardar una por una (tu storage ya controla duplicados y cupo)
        for (const date of sessionReservations) {
            const result = await saveReservation(date, user.uid);

            // Si por carrera el día se llenó entre que lo pintaste y confirmaste
            if (!result?.ok && result?.reason === 'DAY_FULL') {
                // Puedes decidir si abortas todo o sigues con el resto.
                // Aquí lo dejamos como "seguir" para no perder las otras.
                continue;
            }
        }
    };

    const handleConfirm = async () => {
        await confirmarReservaEnFirestore();
        setConfirmToken(t => t + 1);
    };

    return (
        <div className="flex-1 bg-neutral-900 text-white overflow-hidden">

            {/* Scroll container */}
            <div className="h-full overflow-y-auto pb-32">

                <div
                    className="
                        max-w-5xl w-full
                        mx-auto
                        px-3 sm:px-4
                        pt-4
                        pb-20
                        flex flex-col gap-6
                    "
                >

                    {/* Header */}
                    <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0">
                            <h2 className="text-2xl sm:text-3xl font-extrabold truncate">
                                Hola, {user.displayName ?? user.email}
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm">
                                Gestión de parqueo
                            </p>
                        </div>

                        <button
                            onClick={onLogout}
                            className="
                                px-3 sm:px-4 py-2
                                bg-neutral-800 hover:bg-neutral-700
                                rounded-lg text-xs sm:text-sm
                                whitespace-nowrap
                            "
                        >
                            Cerrar sesión
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-neutral-800">
                        {[
                            { id: 'calendar', label: 'Reservar' },
                            { id: 'summary', label: 'Mi resumen' }
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

                        {/* Calendar */}
                        {tab === 'calendar' && (
                            <Calendar
                                user={user}
                                onSessionChange={setSessionReservations}
                                confirmToken={confirmToken}
                            />
                        )}

                        {/* Summary */}
                        {tab === 'summary' && (
                            <div className="h-full flex justify-center">
                                <div className="w-full max-w-3xl flex flex-col gap-4">
                                    <UserSummaryView userId={user.uid} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm button - FIXED FOOTER */}
                    {tab === 'calendar' && (
                        <div className="fixed bottom-28 left-0 w-full z-50 pointer-events-none">
                            <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 flex justify-end">
                                <button
                                    disabled={sessionReservations.length === 0}
                                    onClick={() => setShowConfirmModal(true)}
                                    className={cn(
                                        'pointer-events-auto',
                                        'px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg',
                                        'font-semibold text-sm sm:text-base transition-all shadow-lg',
                                        sessionReservations.length === 0
                                            ? 'bg-[#25234B] text-[#9291A5] cursor-not-allowed'
                                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                    )}
                                >
                                    Confirmar ({sessionReservations.length})
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Confirm modal */}
                    <Modal
                        open={showConfirmModal}
                        title="Confirmar reservas"
                        actions={
                            <>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-3 sm:px-4 py-2 bg-neutral-700 rounded-lg text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        setShowConfirmModal(false);

                                        await handleConfirm();
                                        setSessionReservations([]);
                                    }}
                                    className="px-3 sm:px-4 py-2 bg-indigo-600 rounded-lg font-bold text-sm"
                                >
                                    Confirmar
                                </button>
                            </>
                        }
                    >
                        <ul className="space-y-2">
                            {sessionReservations.map(d => (
                                <li
                                    key={d}
                                    className="bg-neutral-700 rounded-lg px-3 py-2 text-xs sm:text-sm"
                                >
                                    {d}
                                </li>
                            ))}
                        </ul>
                    </Modal>

                </div>
            </div>
        </div>
    );
}
