import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    isToday,
    startOfToday,
    isWeekend
} from 'date-fns';
import { es } from 'date-fns/locale';

import { cn } from '../services/utils';
import { useParkingReservations } from '../hooks/useParkingReservations';
import { useToast } from '../hooks/useToast';
import { Modal } from './Modal';
import { Toast } from './Toast';
import { ROLE_CAPABILITIES } from '../security/roleCapabilities';
import { CancelReservationModal } from './CancelReservationModal';
import { AdminEditReservation } from './admin/AdminEditReservation';

export function Calendar({ user, onLogout }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [sessionReservations, setSessionReservations] = useState([]);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [dayToCancel, setDayToCancel] = useState(null);

    const [showAdminEditModal, setShowAdminEditModal] = useState(false);
    const [adminDay, setAdminDay] = useState(null);

    const capabilities =
        ROLE_CAPABILITIES[user.role] ?? ROLE_CAPABILITIES.user;


    const {
        reserve,
        cancel,
        reserveAsAdmin,
        cancelAsAdmin,
        getStatus,
        getUserReservations,
        loadDay,
        getUserName,
        getAllUsers
    } = useParkingReservations(user.uid);

    const { toast, showToast } = useToast();
    const myDays = getUserReservations();

    /* =====================
       Calendar calculations
    ===================== */

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    /* =====================
       Firestore preload
    ===================== */

    useEffect(() => {
        calendarDays.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            loadDay(dateStr);
        });
    }, [calendarDays, loadDay]);

    /* =====================
       Actions
    ===================== */

    const toggleDay = async (day) => {
        if (
            !capabilities.editPastDays &&
            (day < startOfToday() || isWeekend(day))
        ) {
            return;
        }
        
        const dateStr = format(day, 'yyyy-MM-dd');
        
        if (capabilities.openAdminModal) {
            setAdminDay(dateStr);
            setShowAdminEditModal(true);
            return;
        }

        const status = getStatus(dateStr);

        if (status.users.includes(user.uid)) {
            setDayToCancel(dateStr);
            setShowCancelModal(true);
            return;
        }

        if (status.isFull) {
            showToast('Este día ya está completo');
            return;
        }
        
        // Optimistic update solo si es válido
        setSessionReservations(prev => [...prev, dateStr].sort());
        
        const result = await reserve(dateStr);
        
        // fallback por seguridad
        if (!result?.ok) {
            setSessionReservations(prev => prev.filter(d => d !== dateStr));
        }
    };

    const confirmCancelReservation = async () => {
        if (!dayToCancel) return;

        await cancel(dayToCancel);
        setSessionReservations(prev => prev.filter(d => d !== dayToCancel));

        setDayToCancel(null);
        setShowCancelModal(false);
    };

    const closeCancelModal = () => {
        setDayToCancel(null);
        setShowCancelModal(false);
    };

    /* =====================
       Render
    ===================== */

    return (
        <div className="flex-1 bg-neutral-900 text-white p-3 sm:p-4 pb-32 grid place-items-center overflow-hidden relative">
            <div
                className="
                    max-w-5xl w-full h-full
                    grid grid-rows-[auto_1fr_auto]
                    gap-6 sm:gap-8
                "
            >

                {/* Header */}
                <div className="flex justify-between items-center gap-3">
                    <div className="min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-extrabold truncate">
                            Hola, {user.displayName ?? user.email}
                        </h2>
                        <p className="text-neutral-400 text-xs sm:text-sm">
                        {capabilities.openAdminModal
                            ? 'Modo de gestión activo'
                            : 'Reserva tus días de parqueo'}
                        </p>
                    </div>

                    <button
                        onClick={onLogout}
                        className="px-3 sm:px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs sm:text-sm whitespace-nowrap"
                    >
                        Cerrar Sesión
                    </button>
                </div>


                {/* Calendar */}
                <div className="bg-neutral-800/50 rounded-2xl p-3 sm:p-4 border border-neutral-700 grid grid-rows-[auto_auto_1fr] overflow-hidden">

                    {/* Month header */}
                    <div className="flex items-center justify-between mb-2 gap-2">
                        <h2 className="text-xl sm:text-3xl font-bold capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: es })}
                        </h2>
                        <div className="flex gap-1 sm:gap-2">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-neutral-700 rounded">
                                <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                            </button>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-neutral-700 rounded">
                                <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                            <div key={d} className="text-center text-neutral-400 text-xs sm:text-sm">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5 h-full content-between">
                        {calendarDays.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const status = getStatus(dateStr);

                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const isPastDay = day < startOfToday();
                            const isWeekendDay = isWeekend(day);
                            const isMine = status.users.includes(user.uid);
                            const isFull = status.isFull;

                            const isDisabled =
                                !isCurrentMonth ||
                                (!capabilities.editPastDays && (isPastDay || isWeekendDay));


                            let bg = 'bg-neutral-900/50';
                            let text = 'text-neutral-300';
                            let border = 'border-transparent';

                            if (!isCurrentMonth) {
                                bg = 'bg-neutral-900/20';
                                text = 'text-neutral-600';
                            }

                            if (
                                !capabilities.editPastDays &&
                                (isPastDay || isWeekendDay)
                            ) {
                                bg = 'bg-neutral-900/10';
                                text = 'text-neutral-600';
                            }
                            

                            if (!isDisabled) {
                                if (sessionReservations.includes(dateStr)) {
                                    bg = 'bg-indigo-600 hover:bg-indigo-500';
                                    border = 'border-indigo-400';
                                    text = 'text-white';
                                } else if (isMine) {
                                    bg = 'bg-[#6961A3] hover:brightness-110';
                                    border = 'border-[#6961A3]';
                                    text = 'text-neutral-900';
                                } else if (isFull) {
                                    bg = 'bg-red-900/20';
                                    text = 'text-neutral-500';
                                }
                            }

                            if (isToday(day)) {
                                border = 'border-indigo-500';
                            }

                            return (
                                <button
                                    key={dateStr}
                                    disabled={isDisabled}
                                    onClick={() => toggleDay(day)}
                                    className={cn(
                                        'relative rounded-md sm:rounded-lg border p-1 flex flex-col justify-between',
                                        'transition-all duration-150 ease-out',
                                        'aspect-[4/3]',
                                        !isDisabled && 'hover:scale-[1.02] active:scale-[0.98]',
                                        isMine && !isDisabled && (sessionReservations.includes(dateStr) ? 'shadow-md shadow-indigo-500/30' : 'shadow-md shadow-[#B4B4E6]/30'),
                                        bg,
                                        text,
                                        border,
                                        isDisabled && 'opacity-50 cursor-not-allowed'
                                    )}
                                >
                                    {/* Day number */}
                                    <span className="font-semibold text-sm sm:text-base leading-none">
                                        {format(day, 'd')}
                                    </span>

                                    {/* Users */}
                                    <div className="flex flex-col gap-0.5 items-end text-[10px] sm:text-xs leading-tight">
                                        {status.users.map(uid => (
                                            <span
                                                key={uid}
                                                className={cn(
                                                    'px-1 py-0.5 rounded-full truncate max-w-full',
                                                    uid === user.uid
                                                        ? 'bg-white/20 text-white font-medium'
                                                        : 'bg-neutral-700 text-neutral-300'
                                                )}
                                            >
                                                {getUserName(uid)}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                </div>

                {/* Confirm button - FIXED FOOTER */}
                {!capabilities.openAdminModal && (
                    <div className="
                        fixed bottom-30 left-0 w-full z-50 pointer-events-none
                    ">
                        <div className="max-w-5xl w-full mx-auto px-3 sm:px-4 flex justify-end">
                            <button
                                disabled={sessionReservations.length === 0}
                                onClick={() => setShowConfirmModal(true)}
                                className={cn(
                                    'pointer-events-auto',
                                    'px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-lg font-semibold text-sm sm:text-base transition-all shadow-lg',
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

            </div>

            {/* Modal */}
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
                            onClick={() => {
                                setShowConfirmModal(false);
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

            <CancelReservationModal
                open={showCancelModal}
                dateStr={dayToCancel}
                onCancel={closeCancelModal}
                onConfirm={confirmCancelReservation}
            />
            <AdminEditReservation
                open={showAdminEditModal}
                date={adminDay}
                status={adminDay ? getStatus(adminDay) : { users: [], count: 0, isFull: false }}
                users={getAllUsers ? getAllUsers() : []}
                getUserName={getUserName}
                onClose={() => {
                    setShowAdminEditModal(false);
                    setAdminDay(null);
                }}
                onRemoveUser={async (uid) => {
                    if (!adminDay) return;
                    await cancelAsAdmin(adminDay, uid);
                }}
                onAddUser={async (uid) => {
                    if (!adminDay) return;
                    await reserveAsAdmin(adminDay, uid);
                }}
            />

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
