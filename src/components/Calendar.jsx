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
import { ROLE_CAPABILITIES } from '../security/roleCapabilities';
import { CancelReservationModal } from './CancelReservationModal';
import { AdminEditReservation } from '../components/admin/AdminEditReservation';
import { Toast } from './Toast';

export function Calendar({ user, onSessionChange, confirmToken }) {
    const [currentDate, setCurrentDate] = useState(new Date());
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
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
    
        const startDate = startOfWeek(start, { weekStartsOn: 0 });
        const endDate = endOfWeek(end, { weekStartsOn: 0 });
    
        const days = eachDayOfInterval({ start: startDate, end: endDate });
    
        days.forEach(day => {
            loadDay(format(day, 'yyyy-MM-dd'));
        });
    }, [currentDate, loadDay]);
    

    /* =====================
       Session sync
    ===================== */

    useEffect(() => {
        if (typeof onSessionChange === 'function') {
            onSessionChange(sessionReservations);
        }
    }, [sessionReservations, onSessionChange]);

    /* =====================
       🔧 FIX: limpiar sesión Y recargar estado real
    ===================== */

    useEffect(() => {
        if (confirmToken > 0) {
            setSessionReservations([]);
    
            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);
    
            const startDate = startOfWeek(start, { weekStartsOn: 0 });
            const endDate = endOfWeek(end, { weekStartsOn: 0 });
    
            const days = eachDayOfInterval({ start: startDate, end: endDate });
    
            days.forEach(day => {
                loadDay(format(day, 'yyyy-MM-dd'));
            });
        }
    }, [confirmToken, currentDate, loadDay]);
    

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

        setSessionReservations(prev => [...prev, dateStr].sort());

        const result = await reserve(dateStr);

        if (!result?.ok) {
            setSessionReservations(prev =>
                prev.filter(d => d !== dateStr)
            );
        }
    };

    const confirmCancelReservation = async () => {
        if (!dayToCancel) return;

        await cancel(dayToCancel);
        setSessionReservations(prev =>
            prev.filter(d => d !== dayToCancel)
        );

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
        <div className="bg-neutral-800/50 rounded-2xl p-3 sm:p-4 border border-neutral-700 grid grid-rows-[auto_auto_1fr] overflow-hidden min-h-[50vh] sm:min-h-0">

            {/* Month header */}
            <div className="flex items-center justify-between mb-2 gap-2">
                <h2 className="text-xl sm:text-3xl font-bold capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h2>
                <div className="flex gap-1 sm:gap-2">
                    <button
                        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                        className="p-1 hover:bg-neutral-700 rounded"
                    >
                        <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                    </button>
                    <button
                        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                        className="p-1 hover:bg-neutral-700 rounded"
                    >
                        <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
                    <div
                        key={d}
                        className="text-center text-neutral-400 text-xs sm:text-sm"
                    >
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
                        (!capabilities.editPastDays &&
                            (isPastDay || isWeekendDay));

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

                    if (isMine && isToday(day )) {
                        border = 'border-[#F2F2F2]';
                    } else if (isToday(day) && !isMine) {
                        border = 'border-indigo-500';
                    }

                    return (
                        <button
                            key={dateStr}
                            disabled={isDisabled}
                            onClick={() => toggleDay(day)}
                            className={cn(
                                'w-full h-18 sm:h-25 relative rounded-md sm:rounded-lg border p-1 flex flex-col justify-between',
                                'transition-all duration-150 ease-out',
                                'aspect-[4/3]',
                                !isDisabled &&
                                    'hover:scale-[1.02] active:scale-[0.98]',
                                isMine &&
                                    !isDisabled &&
                                    (sessionReservations.includes(dateStr)
                                        ? 'shadow-md shadow-indigo-500/30'
                                        : 'shadow-md shadow-[#B4B4E6]/30'),
                                bg,
                                text,
                                border,
                                isDisabled &&
                                    'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <span className="font-semibold text-sm sm:text-base leading-none">
                                {format(day, 'd')}
                            </span>

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

            <CancelReservationModal
                open={showCancelModal}
                dateStr={dayToCancel}
                onCancel={closeCancelModal}
                onConfirm={confirmCancelReservation}
            />

            <AdminEditReservation
                open={showAdminEditModal}
                date={adminDay}
                status={
                    adminDay
                        ? getStatus(adminDay)
                        : { users: [], count: 0, isFull: false }
                }
                users={getAllUsers ? getAllUsers() : []}
                getUserName={getUserName}
                onClose={() => {
                    setShowAdminEditModal(false);
                    setAdminDay(null);
                }}
                onRemoveUser={async uid => {
                    if (!adminDay) return;
                
                    await cancelAsAdmin(adminDay, uid);
                    await loadDay(adminDay);
                }}
                
                onAddUser={async uid => {
                    if (!adminDay) return;
                
                    await reserveAsAdmin(adminDay, uid);
                    await loadDay(adminDay);
                }}
            />

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
