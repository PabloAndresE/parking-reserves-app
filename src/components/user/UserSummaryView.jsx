import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const PRICE_PER_DAY = 4;

/* =====================
   Date helpers
===================== */

function parseLocalDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 12); // mediodía local (anti-UTC bug)
}

function getWeekKey(dateStr) {
    const date = parseLocalDate(dateStr);

    const week = Math.ceil(
        (
            (date - new Date(date.getFullYear(), 0, 1)) / 86400000 +
            new Date(date.getFullYear(), 0, 1).getDay() + 1
        ) / 7
    );

    return `Semana `;
}

function getWeekRange(dates) {
    if (!dates.length) return '';

    const sorted = [...dates].sort();
    const start = parseLocalDate(sorted[0]);
    const end = parseLocalDate(sorted[sorted.length - 1]);

    const formatOpts = { day: '2-digit', month: 'short' };

    const startLabel = start.toLocaleDateString('es-ES', formatOpts);
    const endLabel = end.toLocaleDateString('es-ES', formatOpts);

    return `${startLabel} – ${endLabel}`;
}

/* =====================
   Component
===================== */

export function UserSummaryView({ userId }) {
    const [reservations, setReservations] = useState({});
    const [selectedMonth, setSelectedMonth] = useState('');
    const [loading, setLoading] = useState(true);

    /* =====================
       Load reservations
    ===================== */

    useEffect(() => {
        const loadReservations = async () => {
            setLoading(true);

            const resSnap = await getDocs(
                collection(db, 'parkingReservations')
            );

            const res = {};
            resSnap.forEach(doc => {
                res[doc.id] = doc.data();
            });

            setReservations(res);
            setLoading(false);
        };

        loadReservations();
    }, []);

    /* =====================
       Derived data
    ===================== */

    const reservationsForUser = useMemo(() => {
        if (!userId || !selectedMonth) return [];

        return Object.entries(reservations)
            .filter(
                ([date, data]) =>
                    data.users?.includes(userId) &&
                    date.startsWith(selectedMonth)
            )
            .map(([date]) => date)
            .sort();
    }, [reservations, userId, selectedMonth]);

    const groupedByWeek = useMemo(() => {
        const groups = {};
        reservationsForUser.forEach(date => {
            const week = getWeekKey(date);
            if (!groups[week]) groups[week] = [];
            groups[week].push(date);
        });
        return groups;
    }, [reservationsForUser]);

    const totalAmount = reservationsForUser.length * PRICE_PER_DAY;

    /* =====================
       Render
    ===================== */

    if (loading) {
        return (
            <div className="text-sm text-neutral-400">
                Cargando resumen…
            </div>
        );
    }
    if (!userId) {
        return (
            <div className="text-sm text-neutral-400">
                No se pudo cargar el usuario.
            </div>
        );
    }
    

    return (
        <div className="w-full max-w-3xl flex flex-col gap-4">

            {/* Month selector */}
            <div>
                <label className="text-xs text-neutral-400 mb-1 block">
                    Mes
                </label>
                <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="
                        w-full bg-neutral-800
                        border border-neutral-700
                        rounded-lg px-3 py-2 text-sm
                    "
                >
                    <option value="">Selecciona un mes</option>
                    <option value="2025-12">Diciembre</option>
                    <option value="2026-01">Enero</option>
                </select>
            </div>

            {/* Result */}
            {selectedMonth && (
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-4">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">
                            Resumen de reservas
                        </h3>

                        <span className="text-xs px-3 py-1 rounded-full bg-neutral-700">
                            Total: {reservationsForUser.length}
                        </span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-neutral-300">
                            Total a pagar {selectedMonth}:
                        </span>

                        <span className="px-3 py-1 rounded-full bg-indigo-600 text-sm font-semibold">
                            ${totalAmount} USD
                        </span>
                    </div>

                    {/* Weeks */}
                    {Object.keys(groupedByWeek).length === 0 ? (
                        <p className="text-xs text-neutral-400">
                            No hay reservas este mes.
                        </p>
                    ) : (
                        <div className="space-y-4 max-h-72 scroll-hidden">

                            {Object.entries(groupedByWeek).map(
                                ([week, dates]) => (
                                    <div key={week}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-xs font-semibold text-neutral-300">
                                                {week} · {getWeekRange(dates)}
                                            </div>

                                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-200">
                                                {dates.length} días
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {dates.map(date => (
                                                <div
                                                    key={date}
                                                    className="bg-neutral-700 rounded-lg px-3 py-2 text-xs"
                                                >
                                                    {date}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
