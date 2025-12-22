import React from 'react';
import { cn } from '../../services/utils';
import { Modal } from '../Modal';
import { notifyReservationCancelled } from '../../services/pushwooshNotify';

export function AdminEditReservation({
    open,
    date,
    status,
    users,
    getUserName,
    onClose,
    onRemoveUser,
    onAddUser
}) {
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        setError(null);
    }, [date, open]);

    const handleRemoveUser = async (uid) => {
        try {
            await onRemoveUser(uid);
            notifyReservationCancelled(uid, date);

        } catch (err) {
            console.error('Error al eliminar usuario', err);
        }
    };

    return (
        <Modal
            open={open}
            title={`Editar reservas – ${date}`}
            actions={
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-neutral-700 rounded-lg text-sm"
                >
                    Cerrar
                </button>
            }
        >
            <div className="space-y-4">

                {/* Usuarios actuales */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">
                        Usuarios con reserva
                    </h4>

                    {status.users.length === 0 && (
                        <p className="text-xs text-neutral-400">
                            No hay reservas para este día
                        </p>
                    )}

                    <ul className="space-y-1">
                        {status.users.map(uid => (
                            <li
                                key={uid}
                                className="flex justify-between items-center bg-neutral-700/50 px-2 py-1 rounded"
                            >
                                <span className="text-sm truncate">
                                    {getUserName(uid)}
                                </span>

                                <button
                                    onClick={() => handleRemoveUser(uid)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Agregar usuario */}
                <div>
                    <h4 className="text-sm font-semibold mb-2">
                        Agregar usuario
                    </h4>

                    <select
                        className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm"
                        defaultValue=""
                        onChange={(e) => {
                            const uid = e.target.value;
                            if (!uid) return;
                            if (status.isFull) {
                                setError('Este día ya tiene el cupo completo');
                                e.target.value = '';
                                return;
                            }
                            onAddUser(uid);
                            setError(null);
                            e.target.value = '';
                        }}
                    >
                        <option value="" disabled>
                            Selecciona un usuario
                        </option>

                        {users
                            .filter(u => !status.users.includes(u.uid))
                            .map(u => (
                                <option key={u.uid} value={u.uid}>
                                    {u.displayName ?? u.email}
                                </option>
                            ))}
                    </select>
                </div>

            </div>

            {error && (
                <div className="mt-4 border-t border-neutral-700 pt-3">
                    <div className="bg-red-900/20 text-red-400 text-xs rounded-lg px-3 py-2">
                        {error}
                    </div>
                </div>
            )}
        </Modal>
    );
}
